import { createHash } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Shared core for the app's same-origin JSON POST proxy routes (`/api/graphql`,
 * `/api/rpc`, …). It owns the boilerplate every proxy needs — a POST-only guard,
 * JSON body parsing, the upstream fetch, response passthrough and failure handling
 * — so each route only declares its own policy: which upstream to hit and which
 * requests to reject.
 *
 * The per-route `resolve` callback inspects the parsed body (and the request) and
 * returns either the upstream target (+ optional extra headers) or a rejection
 * (status + body). Everything a route wants to forbid — disallowed GraphQL
 * operations, unknown chainIds — lives there, in whatever body shape that route
 * wants.
 *
 * The transport-level errors this helper owns (405 / 400 / 502) are returned as a
 * plain `{ errors: [{ message }] }` envelope. Callers key off the HTTP status
 * (viem and graphql-request both throw on non-2xx without reading the body), so the
 * envelope is purely diagnostic and shared by every route. A route may set
 * `upstreamErrorMessage` on a successful resolution to label its own 502.
 *
 * Reuse is opt-in per resolution (`cache`) and off by default, because it is only
 * ever correct for a route that says so: `/api/rpc` carries nonce reads, gas
 * estimates and transaction broadcasts, where answering from an earlier response
 * would be wrong. A route that does opt in gets the four behaviours in
 * `serveCached` — a TTL cache, single-flight, stale answers while the upstream is
 * failing, and retry windows that stop a failing upstream, or a question it will
 * not answer, from being asked again on every request — and may name a `fallback`
 * to answer while its upstream is rate-limiting.
 */

export type ProxyCache = {
  /**
   * What makes two requests interchangeable: it has to cover everything that can change the
   * answer. Any length will do, since the cache files it under a digest.
   */
  key: string
  /** How long a successful response may be reused, in milliseconds. */
  ttl: number
}

/** Where to send a request, with whatever it needs that the caller's request does not carry. */
export type ProxyUpstream = {
  upstream: string
  headers?: Record<string, string>
}

export type ProxyResolution =
  | (ProxyUpstream & {
      ok: true
      /**
       * What to send upstream, when the parsed request body is not it.
       */
      forwardBody?: unknown
      upstreamErrorMessage?: string
      cache?: ProxyCache
      /**
       * A second upstream serving the same answers, asked only when `upstream` refuses with a 429.
       * It adds quota, not redundancy: any other failure reaches the caller as it would without
       * one. Read only alongside `cache`, where the retry windows and the test for a usable answer
       * live.
       */
      fallback?: ProxyUpstream
    })
  | { ok: false; status: number; body: unknown }

type Forwarded = ProxyResolution & { ok: true }

type UpstreamResponse = {
  status: number
  contentType: string
  payload: string
  /**
   * Whether it may be reused (see `isCacheable`). Settled once, as it arrives, and only for a route
   * that caches: every caller sharing a response needs to know, and parsing it is the costly part.
   */
  cacheable: boolean
  /** When this stops counting as fresh. */
  expiresAt: number
  /** Answered by the resolution's fallback, its upstream having refused with a 429. */
  fromFallback?: boolean
}

/**
 * Caps on cached responses: how many, and how much text they add up to. The explorer searches by
 * arbitrary transaction hash, so the set of distinct keys is unbounded by construction and a busy day
 * must not grow this process's heap, and a count alone does not bound it when a single 500-row page
 * runs to a megabyte. Text is counted in characters, which V8 keeps at a byte each for ASCII JSON.
 * `Map` iterates in insertion order and every use moves an entry to the end, so dropping the first
 * key drops the least recently used entry.
 */
const MAX_ENTRIES = 500
const MAX_BYTES = 64 * 1024 * 1024

/**
 * How long past its TTL an entry may still answer while the upstream is refusing to. A rate-limit
 * window or a restart lasts seconds to minutes; past that the data is too old to pass off as
 * current and the failure should reach the caller instead.
 */
const STALE_GRACE = 5 * 60_000

/**
 * How long a failing upstream, or a question it would not answer, is left alone before a caller
 * asks again.
 *
 * Nothing else provides this. A response that cannot be cached is never stored, so the entry that
 * produced it keeps its old `expiresAt`, and the next request — arriving after single-flight has
 * settled and cleared `inFlight` — fetches again. Without a retry window the proxy amplifies the
 * very quota it exists to protect: 20 viewers polling one key at 5s go from ~6 upstream requests a
 * minute to ~240, precisely while the indexer is refusing them and the window most needs to drain.
 *
 * Any answer that cannot be cached holds off its own key. Only an upstream that cannot answer at all
 * — a spent quota, a dead process — is held off for every key, because that is a property of the
 * upstream and not of the question asked. An error one question's variables caused says nothing
 * about the next question, and replaying it there would let any caller fail everyone else's
 * requests. Short enough that recovery costs a caller one stale answer at worst.
 */
const RETRY_AFTER = 2_000

const responses = new Map<string, UpstreamResponse>()

/** What the cached payloads and their keys add up to, held against `MAX_BYTES`. */
let cachedBytes = 0

/** Upstream requests already in flight, so N callers waiting on one key cost one upstream request. */
const inFlight = new Map<string, Promise<UpstreamResponse>>()

/**
 * Per upstream: the failure it is being left alone over, until when, and when the request that met
 * that failure was sent.
 */
const failing = new Map<string, { response: UpstreamResponse; until: number; sentAt: number }>()

/** Per key: the last answer it got that could not be cached, and until when it is not asked again. */
const failingKeys = new Map<string, { response: UpstreamResponse; until: number }>()

const errorBody = (message: string) => ({ errors: [{ message }] })

/** The upstream could not answer, as opposed to having refused this particular request. */
const isUpstreamFailure = (status: number) => status === 429 || status >= 500

/**
 * A GraphQL upstream reports a failed query as `200` with a top-level `errors` array, so the
 * status alone cannot decide this: caching one of those would pin the failure for the whole TTL.
 */
const isCacheable = (status: number, payload: string) => {
  if (status !== 200) return false

  try {
    const errors = (JSON.parse(payload) as { errors?: unknown } | null)?.errors
    return !Array.isArray(errors) || errors.length === 0
  } catch {
    return false
  }
}

/**
 * What the cache files a route's key under. Its fixed length keeps every lookup cheap however long
 * a caller makes its variables: V8 hashes a string past 16k characters by its length alone, so long
 * keys of one length would all share a bucket and every lookup would compare them in full.
 */
const digest = (key: string) => createHash('sha256').update(key).digest('base64')

/**
 * Moves an entry to the most recent position. Called whenever one is used, not only when it is
 * written, but only while it is still the one stored: a stale copy may have been evicted or
 * replaced while its caller waited.
 */
const touch = (key: string, response: UpstreamResponse) => {
  if (responses.get(key) !== response) return

  responses.delete(key)
  responses.set(key, response)
}

const sizeOf = (key: string, response: UpstreamResponse) => key.length + response.payload.length

const evict = (key: string) => {
  const response = responses.get(key)
  if (!response) return

  responses.delete(key)
  cachedBytes -= sizeOf(key, response)
}

/**
 * Stores a response in place of any earlier one for its key. Entries too old to answer even as
 * stale copies go first, then the least recently used, until both caps hold again. The entry just
 * stored is never dropped, so one bigger than the whole budget still serves its TTL, alone.
 */
const store = (key: string, response: UpstreamResponse) => {
  const now = Date.now()
  for (const [storedKey, stored] of responses) {
    if (stored.expiresAt + STALE_GRACE <= now) evict(storedKey)
  }

  evict(key)
  responses.set(key, response)
  cachedBytes += sizeOf(key, response)

  for (const storedKey of responses.keys()) {
    if (storedKey === key || (responses.size <= MAX_ENTRIES && cachedBytes <= MAX_BYTES)) break
    evict(storedKey)
  }
}

/** Stands in for a response when the fetch itself failed, so that outcome can be replayed too. */
const unreachable = (resolution: Forwarded): UpstreamResponse => ({
  status: 502,
  contentType: 'application/json',
  payload: JSON.stringify(errorBody(resolution.upstreamErrorMessage ?? 'Upstream request failed')),
  cacheable: false,
  expiresAt: 0,
})

/**
 * Leaves a key alone for a retry window, `response` answering for it meanwhile. Every hold lasts
 * the same RETRY_AFTER, so insertion order is expiry order and the holds that have run out are
 * always the first ones: dropping them there keeps this map to what the last window asked.
 */
const holdOffKey = (key: string, response: UpstreamResponse) => {
  const now = Date.now()
  failingKeys.delete(key)
  failingKeys.set(key, { response, until: now + RETRY_AFTER })

  for (const [heldKey, { until }] of failingKeys) {
    if (until > now && failingKeys.size <= MAX_ENTRIES) break
    failingKeys.delete(heldKey)
  }
}

/** The answer a key is being left alone over, for as long as its retry window lasts. */
const heldAnswer = (key: string, now: number) => {
  const held = failingKeys.get(key)
  return held && held.until > now ? held.response : undefined
}

/** The failure an upstream is being left alone over, for as long as its retry window lasts. */
const heldFailure = ({ upstream }: ProxyUpstream, now: number) => {
  const held = failing.get(upstream)
  return held && held.until > now ? held : undefined
}

/** The resolution's fallback, unless it has none or it is sitting out a retry window of its own. */
const availableFallback = ({ fallback }: Forwarded, now: number) =>
  fallback && !heldFailure(fallback, now) ? fallback : undefined

/** Asks `target`: the resolution's own upstream, unless its fallback is being asked instead. */
const fetchUpstream = async (
  resolution: Forwarded,
  body: unknown,
  target: ProxyUpstream = resolution,
): Promise<UpstreamResponse> => {
  const upstream = await fetch(target.upstream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...target.headers,
    },
    body: JSON.stringify(body),
  })
  const payload = await upstream.text()

  return {
    status: upstream.status,
    contentType: upstream.headers.get('content-type') || 'application/json',
    payload,
    cacheable: Boolean(resolution.cache) && isCacheable(upstream.status, payload),
    expiresAt: Date.now() + (resolution.cache?.ttl ?? 0),
  }
}

/**
 * Says when an upstream with a fallback starts and stops rate-limiting: the fallback answers in
 * between, and nothing else would show it. Compared with the failure on record before this response
 * replaces it, so a run of 429s logs once at each end rather than on every retry. Host only, since
 * some upstream URLs carry a key in their path.
 */
const logRateLimit = ({ upstream }: ProxyUpstream, response: UpstreamResponse) => {
  const wasLimited = failing.get(upstream)?.response.status === 429
  const isLimited = response.status === 429
  if (wasLimited === isLimited) return

  const { host } = new URL(upstream)
  if (isLimited) console.warn(`[proxy] ${host} is rate-limiting; its fallback answers meanwhile`)
  else console.info(`[proxy] ${host} is no longer rate-limiting; its fallback is not asked`)
}

/**
 * Keeps an upstream's retry window: an answer saying it cannot answer at all starts it, any other
 * answer clears it. Ordered by when each request was sent, not by when its answer arrived, so a
 * slow answer cannot overrule a newer one: a success admitted just before the quota ran out, landing
 * after the 429 that followed it, would otherwise reopen the upstream to everyone.
 */
const record = (
  resolution: Forwarded,
  target: ProxyUpstream,
  response: UpstreamResponse,
  sentAt: number,
) => {
  const held = failing.get(target.upstream)
  if (held && sentAt <= held.sentAt) return

  if (target === resolution && resolution.fallback) logRateLimit(target, response)

  if (isUpstreamFailure(response.status)) {
    failing.set(target.upstream, { response, until: Date.now() + RETRY_AFTER, sentAt })
  } else {
    failing.delete(target.upstream)
  }
}

/**
 * `fetchUpstream`, with the outcome recorded against `target`'s retry window. A fetch that fails
 * outright is rethrown once recorded.
 *
 * Asking an upstream still on record as failing, once its window has run out, is the probe that
 * window was waiting for. The window restarts as the probe goes out, so whoever arrives meanwhile is
 * answered as inside it rather than sending a probe of their own: one per window for the whole
 * process, whatever the traffic.
 */
const ask = async (resolution: Forwarded, body: unknown, target: ProxyUpstream = resolution) => {
  const sentAt = Date.now()
  const held = failing.get(target.upstream)
  if (held) failing.set(target.upstream, { ...held, until: sentAt + RETRY_AFTER })

  const response = await fetchUpstream(resolution, body, target).catch((error) => {
    record(resolution, target, unreachable(resolution), sentAt)
    throw error
  })

  record(resolution, target, response, sentAt)

  return response
}

/**
 * The fallback's answer to a question its upstream refused with a 429, when it has a usable one.
 * Anything short of that — no fallback, its own retry window, a refusal, an unreachable host, a
 * GraphQL error (which is how a schema the two do not share would show) — leaves the 429 to stand,
 * exactly as if there were no fallback.
 */
const askFallback = async (resolution: Forwarded, body: unknown) => {
  const fallback = availableFallback(resolution, Date.now())
  if (!fallback) return undefined

  const response = await ask(resolution, body, fallback).catch(() => undefined)
  if (!response?.cacheable) return undefined

  return { ...response, fromFallback: true }
}

const send = (res: NextApiResponse, response: UpstreamResponse, state?: string) => {
  res.status(response.status)
  res.setHeader('Content-Type', response.contentType)
  // Diagnostic only: lets a `curl -D-` say whether a deploy is actually collapsing requests.
  if (state) res.setHeader('X-Proxy-Cache', state)
  // Likewise whether this answer, fresh or reused, came from the fallback.
  if (response.fromFallback) res.setHeader('X-Proxy-Upstream', 'fallback')
  return res.send(response.payload)
}

const serveStale = (res: NextApiResponse, key: string, stale: UpstreamResponse) => {
  touch(key, stale)
  return send(res, stale, 'STALE')
}

const serveCached = async (
  res: NextApiResponse,
  resolution: Forwarded & { cache: ProxyCache },
  body: unknown,
) => {
  const key = digest(resolution.cache.key)
  const now = Date.now()
  const cached = responses.get(key)

  if (cached && cached.expiresAt > now) {
    touch(key, cached)
    return send(res, cached, 'HIT')
  }

  // Captured before the fetch: once it succeeds it overwrites this entry, and the point of holding
  // on to it is to have something to answer with if it does not.
  const stale = cached && cached.expiresAt + STALE_GRACE > now ? cached : undefined

  let pending = inFlight.get(key)
  const coalesced = Boolean(pending)

  if (!pending) {
    // Inside a retry window nobody asks again; the last words stand in, which is what this caller
    // would have been told had it asked: this key's own, if it was the one turned away, or else the
    // upstream's, which it would have run into all the same. A key with something stale to show
    // prefers that, on the same terms as after a live failure.
    //
    // A request already in flight for this key outranks both windows, which is why they are only
    // read when there is none: that fetch may well be about to succeed, and joining it beats
    // replaying a failure collected a moment ago.
    //
    // A refused quota is the exception when the route has a fallback free to answer: the question
    // skips the upstream and goes there, as it would have after a fresh 429.
    const held = heldFailure(resolution, now)
    const diverted = held?.response.status === 429 && Boolean(availableFallback(resolution, now))
    const cooldown = heldAnswer(key, now) ?? (diverted ? undefined : held?.response)

    if (cooldown) return stale ? serveStale(res, key, stale) : send(res, cooldown, 'COOLDOWN')

    pending = (async () => {
      // Only a diverted request gets here with `held` set, and its 429 stands in for asking.
      const response = held ? held.response : await ask(resolution, body)

      // A live answer from the fallback outranks a stale one, which is only what is left once
      // both upstreams have failed.
      const answer =
        response.status === 429 ? ((await askFallback(resolution, body)) ?? response) : response

      if (answer.cacheable) store(key, answer)
      else holdOffKey(key, answer)

      return answer
    })().finally(() => inFlight.delete(key))

    inFlight.set(key, pending)
  }

  try {
    const response = await pending

    // A rate-limited or broken indexer would otherwise reach `useSuspenseQuery` and trip the error
    // boundary. Slightly old counts are a better answer than an error screen. The status does not
    // decide it: the key covers the whole request, so a key that answered before and fails now
    // points at the upstream, and Hasura reports a database it cannot reach as a `200` with errors.
    if (stale && !response.cacheable) return serveStale(res, key, stale)

    return send(res, response, coalesced ? 'COALESCED' : 'MISS')
  } catch {
    if (stale) return serveStale(res, key, stale)

    return send(res, unreachable(resolution))
  }
}

export async function proxyJsonPost(
  req: NextApiRequest,
  res: NextApiResponse,
  resolve: (body: unknown, req: NextApiRequest) => ProxyResolution,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json(errorBody('Method not allowed'))
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json(errorBody('Invalid JSON body'))
    }
  }

  const resolution = resolve(body, req)
  if (!resolution.ok) {
    return res.status(resolution.status).json(resolution.body)
  }

  // Only what the route vouches for goes on the wire; the raw body is the fallback for a route that
  // forwards verbatim by design, like `/api/rpc`.
  const forwarded = resolution.forwardBody ?? body

  const { cache } = resolution
  if (cache) return serveCached(res, { ...resolution, cache }, forwarded)

  try {
    return send(res, await fetchUpstream(resolution, forwarded))
  } catch {
    return send(res, unreachable(resolution))
  }
}
