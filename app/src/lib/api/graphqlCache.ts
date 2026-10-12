/**
 * What `/api/graphql` keeps between requests, so that the indexer's quota (250 requests a minute,
 * shared by every visitor) stops depending on how many visitors there are:
 *  - everyone asking the same question within its TTL shares one indexer request;
 *  - an indexer that answers 429 or 5xx, or not at all, is left alone for `COOLDOWN`, then probed
 *    by a single request;
 *  - while the main indexer answers 429, the fallback (a second indexer, with a quota of its own)
 *    is asked instead;
 *  - when no indexer gives a usable answer, the last one stored stands in, for up to `STALE_GRACE`.
 *
 * All of it lives in the server process, so it holds whatever the number of replicas.
 */

/** An indexer to ask. Logged by name: both indexers may share a host, and a URL may carry a key. */
export type Upstream = { name: string; url: string; headers?: Record<string, string> }

/** An indexer's answer, read whole. */
export type Answer = { status: number; contentType: string; payload: string }

export type CachedRequest = {
  /** The JSON sent upstream. It is the whole question, so requests with the same body share one. */
  body: string
  /** How long an answer may be reused, in milliseconds. */
  ttl: number
  upstream: Upstream
  /** Asked only while `upstream` answers 429. */
  fallback?: Upstream
}

type Entry = { answer: Answer; freshUntil: number; staleUntil: number }

type Refreshed = { answer: Answer; usable: boolean }

/**
 * The slowest answer measured took ~6s (a cold validators query). Without a limit, a stuck
 * connection would hold its key, and everyone waiting on it, for minutes.
 */
const TIMEOUT = 15_000

const COOLDOWN = 2_000

/** Long enough to ride out a rate-limit window or a restart, short of passing off old data. */
const STALE_GRACE = 5 * 60_000

/** A 500-row transactions page runs to ~1 MB of text, so the count alone does not bound memory. */
const MAX_ENTRIES = 500
const MAX_CHARS = 64 * 1024 * 1024

const entries = new Map<string, Entry>()
let cachedChars = 0

const inFlight = new Map<string, Promise<Refreshed>>()

/** Per indexer URL: until when it is left alone, and its failing answer (none if it gave none). */
const cooldowns = new Map<string, { until: number; answer?: Answer }>()

/** GraphQL reports a failed query as a 200 with `errors`: only a clean 200 may be reused. */
const isUsable = ({ payload, status }: Answer) => {
  if (status !== 200) return false

  try {
    return !(JSON.parse(payload) as { errors?: unknown } | null)?.errors
  } catch {
    return false
  }
}

const sizeOf = (key: string, entry: Entry) => key.length + entry.answer.payload.length

const forget = (key: string) => {
  const entry = entries.get(key)
  if (!entry) return

  entries.delete(key)
  cachedChars -= sizeOf(key, entry)
}

/** Stores an answer. A `Map` iterates in insertion order, so the oldest entries make room. */
const store = (key: string, answer: Answer, ttl: number) => {
  const now = Date.now()
  const entry = { answer, freshUntil: now + ttl, staleUntil: now + ttl + STALE_GRACE }

  forget(key)
  entries.set(key, entry)
  cachedChars += sizeOf(key, entry)

  for (const oldest of entries.keys()) {
    if (entries.size <= MAX_ENTRIES && cachedChars <= MAX_CHARS) break
    forget(oldest)
  }
}

const coolingDown = ({ url }: Upstream) => {
  const cooldown = cooldowns.get(url)
  return cooldown && cooldown.until > Date.now() ? cooldown : undefined
}

const coolDown = ({ name, url }: Upstream, answer?: Answer) => {
  // Logged once as the failures start, not again for every probe that finds them still going on.
  if (!cooldowns.has(url)) {
    console.warn(`[api/graphql] ${name} failed with ${answer?.status ?? 'no answer'}, cooling down`)
  }

  cooldowns.set(url, { until: Date.now() + COOLDOWN, answer })
}

const fetchUpstream = async ({ headers, url }: Upstream, body: string): Promise<Answer> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
    signal: AbortSignal.timeout(TIMEOUT),
  })

  return {
    status: response.status,
    contentType: response.headers.get('content-type') || 'application/json',
    payload: await response.text(),
  }
}

/**
 * Asks `target`, keeping its cooldown: a 429, a 5xx or no answer at all starts one, anything else
 * ends it. A request to an indexer on record as failing is the probe its cooldown was waiting for,
 * so the cooldown is stretched over the probe and nobody else sends one meanwhile.
 */
const ask = async (target: Upstream, body: string) => {
  const cooldown = cooldowns.get(target.url)
  if (cooldown) cooldowns.set(target.url, { ...cooldown, until: Date.now() + TIMEOUT })

  let answer: Answer
  try {
    answer = await fetchUpstream(target, body)
  } catch (error) {
    coolDown(target)
    throw error
  }

  if (answer.status === 429 || answer.status >= 500) coolDown(target, answer)
  else if (cooldowns.delete(target.url)) console.info(`[api/graphql] ${target.name} is back`)

  return answer
}

/**
 * A fresh answer, stored if usable. An indexer cooling down is not asked: its last failure answers
 * for it. A 429 goes to the fallback, whose answer replaces it only if usable, so a fallback that
 * cannot help leaves things as they would be without one.
 */
const refresh = async (request: CachedRequest): Promise<Refreshed> => {
  const { body, fallback, ttl, upstream } = request

  const cooldown = coolingDown(upstream)
  let answer = cooldown ? cooldown.answer : await ask(upstream, body)
  if (!answer) throw new Error(`${upstream.name} is not answering`)

  let usable = isUsable(answer)

  if (answer.status === 429 && fallback && !coolingDown(fallback)) {
    const fallbackAnswer = await ask(fallback, body).catch(() => undefined)
    if (fallbackAnswer && isUsable(fallbackAnswer)) {
      answer = fallbackAnswer
      usable = true
    }
  }

  if (usable) store(body, answer, ttl)

  return { answer, usable }
}

/**
 * The answer to `request`: the stored one while fresh, else one refresh shared by everyone asking.
 * When the refresh brings nothing usable, a stale answer stands in if there is one; if not, the
 * failure reaches the caller, thrown when no indexer answered at all.
 */
export const fetchCached = async (request: CachedRequest): Promise<Answer> => {
  const { body: key } = request
  const now = Date.now()
  const entry = entries.get(key)
  if (entry && entry.freshUntil > now) return entry.answer

  // Set aside now: a successful refresh replaces the entry.
  const stale = entry && entry.staleUntil > now ? entry : undefined

  let pending = inFlight.get(key)
  if (!pending) {
    pending = refresh(request).finally(() => inFlight.delete(key))
    inFlight.set(key, pending)
  }

  try {
    const { answer, usable } = await pending
    if (usable || !stale) return answer
  } catch (error) {
    if (!stale) throw error
  }

  // Served as fresh for a cooldown, so this key is not refreshed again on every request.
  stale.freshUntil = Date.now() + COOLDOWN
  return stale.answer
}
