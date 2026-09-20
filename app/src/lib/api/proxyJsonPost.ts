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
 * would be wrong. A route that does opt in gets the three behaviours in
 * `serveCached` — a TTL cache, single-flight, and stale answers while the upstream
 * is failing.
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

export type ProxyResolution =
  | {
      ok: true
      upstream: string
      headers?: Record<string, string>
      upstreamErrorMessage?: string
      cache?: ProxyCache
    }
  | { ok: false; status: number; body: unknown }

type Forwarded = ProxyResolution & { ok: true }

type UpstreamResponse = {
  status: number
  contentType: string
  payload: string
  /** When this stops counting as fresh. */
  expiresAt: number
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

const responses = new Map<string, UpstreamResponse>()

/** Upstream requests already in flight, so N callers waiting on one key cost one upstream request. */
const inFlight = new Map<string, Promise<UpstreamResponse>>()

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

const fetchUpstream = async (resolution: Forwarded, body: unknown): Promise<UpstreamResponse> => {
  const upstream = await fetch(resolution.upstream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...resolution.headers,
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

const send = (res: NextApiResponse, response: UpstreamResponse, state?: string) => {
  res.status(response.status)
  res.setHeader('Content-Type', response.contentType)
  // Diagnostic only: lets a `curl -D-` say whether a deploy is actually collapsing requests.
  if (state) res.setHeader('X-Proxy-Cache', state)
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

  if (!pending) {
    pending = (async () => {
      const response = await fetchUpstream(resolution, body)
      if (isCacheable(response)) store(key, response)
      return response
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

    return res
      .status(502)
      .json(errorBody(resolution.upstreamErrorMessage ?? 'Upstream request failed'))
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

  const { cache } = resolution
  if (cache) return serveCached(res, { ...resolution, cache }, body)

  try {
    return send(res, await fetchUpstream(resolution, body))
  } catch {
    return res
      .status(502)
      .json(errorBody(resolution.upstreamErrorMessage ?? 'Upstream request failed'))
  }
}
