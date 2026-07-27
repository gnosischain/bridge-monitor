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
 */

export type ProxyResolution =
  | { ok: true; upstream: string; headers?: Record<string, string>; upstreamErrorMessage?: string }
  | { ok: false; status: number; body: unknown }

const errorBody = (message: string) => ({ errors: [{ message }] })

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

  try {
    const upstream = await fetch(resolution.upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...resolution.headers,
      },
      body: JSON.stringify(body),
    })

    const payload = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.send(payload)
  } catch {
    return res
      .status(502)
      .json(errorBody(resolution.upstreamErrorMessage ?? 'Upstream request failed'))
  }
}
