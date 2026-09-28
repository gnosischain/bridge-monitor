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
 * failing, and a retry window that stops a failing upstream from being asked again
 * on every request — and may name a `fallback` to answer while its upstream is
 * rate-limiting.
 */

export type ProxyCache = {
  /**
   * What makes two requests interchangeable: it has to cover everything that can change the
   * answer.
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
  /** When this stops counting as fresh. */
  expiresAt: number
  /** Answered by the resolution's fallback, its upstream having refused with a 429. */
  fromFallback?: boolean
}

/**
 * Cap on cached responses. The explorer searches by arbitrary transaction hash, so the set of
 * distinct keys is unbounded by construction and a busy day must not grow this process's heap. `Map`
 * iterates in insertion order, so dropping the first key drops the least recently stored entry.
 */
const MAX_ENTRIES = 500

/**
 * How long past its TTL an entry may still answer while the upstream is refusing to. A rate-limit
 * window or a restart lasts seconds to minutes; past that the data is too old to pass off as
 * current and the failure should reach the caller instead.
 */
const STALE_GRACE = 5 * 60_000

/**
 * How long a failing upstream is left alone before a caller asks it again.
 *
 * Nothing else provides this. A response that cannot be cached is never stored, so the entry that
 * produced it keeps its old `expiresAt`, and the next request — arriving after single-flight has
 * settled and cleared `inFlight` — fetches again. Without a retry window the proxy amplifies the
 * very quota it exists to protect: 20 viewers polling one key at 5s go from ~6 upstream requests a
 * minute to ~240, precisely while the indexer is refusing them and the window most needs to drain.
 *
 * Held per upstream rather than per key, because a spent quota and a dead process are properties of
 * the upstream and not of the question asked — which also flattens the arithmetic to one retry per
 * window for the whole process, whatever the traffic. Short enough that recovery costs a caller one
 * stale answer at worst.
 */
const RETRY_AFTER = 2_000

const responses = new Map<string, UpstreamResponse>()

/** Upstream requests already in flight, so N callers waiting on one key cost one upstream request. */
const inFlight = new Map<string, Promise<UpstreamResponse>>()

/**
 * The last answer an upstream gave that could not be cached, and when it may be asked again.
 */
const failing = new Map<string, { response: UpstreamResponse; until: number }>()

const errorBody = (message: string) => ({ errors: [{ message }] })

/** The upstream could not answer, as opposed to having refused this particular request. */
const isUpstreamFailure = (status: number) => status === 429 || status >= 500

/**
 * A GraphQL upstream reports a failed query as `200` with a top-level `errors` array, so the
 * status alone cannot decide this: caching one of those would pin the failure for the whole TTL.
 */
const isCacheable = ({ payload, status }: UpstreamResponse) => {
  if (status !== 200) return false

  try {
    const errors = (JSON.parse(payload) as { errors?: unknown } | null)?.errors
    return !Array.isArray(errors) || errors.length === 0
  } catch {
    return false
  }
}

/**
 * Moves an entry to the most recent position. Called whenever one is used, not only when it is
 * written.
 */
const touch = (key: string, response: UpstreamResponse) => {
  responses.delete(key)
  responses.set(key, response)
}

const store = (key: string, response: UpstreamResponse) => {
  touch(key, response)

  while (responses.size > MAX_ENTRIES) {
    const oldest = responses.keys().next()
    if (oldest.done) break
    responses.delete(oldest.value)
  }
}

/** Stands in for a response when the fetch itself failed, so that outcome can be replayed too. */
const unreachable = (resolution: Forwarded): UpstreamResponse => ({
  status: 502,
  contentType: 'application/json',
  payload: JSON.stringify(errorBody(resolution.upstreamErrorMessage ?? 'Upstream request failed')),
  expiresAt: 0,
})

/**
 * Notes that this upstream is not answering, and until when. Cleared by the next cacheable response,
 * so an upstream that comes back is asked again on the first request after the window.
 */
const holdOff = ({ upstream }: ProxyUpstream, response: UpstreamResponse) => {
  failing.set(upstream, { response, until: Date.now() + RETRY_AFTER })
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

  return {
    status: upstream.status,
    contentType: upstream.headers.get('content-type') || 'application/json',
    payload: await upstream.text(),
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

/** Keeps an upstream's retry window: a cacheable response clears it, anything else starts it. */
const record = (resolution: Forwarded, target: ProxyUpstream, response: UpstreamResponse) => {
  if (target === resolution && resolution.fallback) logRateLimit(target, response)

  if (isCacheable(response)) failing.delete(target.upstream)
  else holdOff(target, response)
}

/**
 * `fetchUpstream`, with the outcome recorded against `target`'s retry window. A fetch that fails
 * outright is rethrown once recorded.
 */
const ask = async (resolution: Forwarded, body: unknown, target: ProxyUpstream = resolution) => {
  const response = await fetchUpstream(resolution, body, target).catch((error) => {
    record(resolution, target, unreachable(resolution))
    throw error
  })

  record(resolution, target, response)

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
  if (!response || !isCacheable(response)) return undefined

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
  const { key } = resolution.cache
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

  // Inside the retry window nobody asks again; the upstream's own last words stand in, which is
  // what this caller would have been told had it asked. A key with something stale to show prefers
  // that, on the same terms as after a live failure. The words may have been said to a different
  // key, but a refused quota or a broken schema is not answering that one either.
  //
  // A request already in flight for this key outranks the window, which is why this is read after
  // `inFlight` and not before: that fetch may well be about to succeed, and joining it beats
  // replaying a failure another key collected a moment ago.
  //
  // A refused quota is the exception when the route has a fallback free to answer: the question
  // skips the upstream and goes there, as it would have after a fresh 429.
  const held = heldFailure(resolution, now)
  const diverted = held?.response.status === 429 && Boolean(availableFallback(resolution, now))

  if (!pending && held && !diverted) {
    if (stale && isUpstreamFailure(held.response.status)) return serveStale(res, key, stale)

    return send(res, held.response, 'COOLDOWN')
  }

  if (!pending) {
    pending = (async () => {
      // Only a diverted request gets here with `held` set, and its 429 stands in for asking.
      const response = held ? held.response : await ask(resolution, body)

      // A live answer from the fallback outranks a stale one, which is only what is left once
      // both upstreams have failed.
      const answer =
        response.status === 429 ? ((await askFallback(resolution, body)) ?? response) : response

      if (isCacheable(answer)) store(key, answer)

      return answer
    })().finally(() => inFlight.delete(key))

    inFlight.set(key, pending)
  }

  try {
    const response = await pending

    // A rate-limited or broken indexer would otherwise reach `useSuspenseQuery` and trip the error
    // boundary. Slightly old counts are a better answer than an error screen.
    if (stale && isUpstreamFailure(response.status)) return serveStale(res, key, stale)

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
