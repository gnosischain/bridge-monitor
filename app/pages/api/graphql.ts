import type { NextApiRequest, NextApiResponse } from 'next'

import { ENVIO_QUERY_POLICY, EnvioPolicy } from '@/src/lib/api/envioQueryPolicy'
import { ProxyResolution, ProxyUpstream, proxyJsonPost } from '@/src/lib/api/proxyJsonPost'

/**
 * Server-side proxy for the Envio GraphQL indexer.
 *
 * The browser talks to this same-origin route instead of the indexer directly, so:
 *  - the real indexer URL never ships in the client bundle;
 *  - the API-key/bearer token stays server-only (never exposed to the browser);
 *  - only the exact GraphQL documents the app ships are forwarded, asked only with
 *    variables the app could have produced (`ENVIO_QUERY_POLICY`)
 *  - visitors asking the same question share one upstream request;
 *  - while the indexer is rate-limiting, a second one can answer in its place.
 *
 * The POST guard, body parsing, caching and fallback live in `proxyJsonPost`;
 * this file declares the Envio-specific policy and `envioQueryPolicy` the per-document
 * shape of a legitimate request.
 */

const ENVIO_URL = process.env.ENVIO_INDEXER_URL || 'http://localhost:8080/v1/graphql'

const ENVIO_TOKEN = process.env.ENVIO_INDEXER_TOKEN

const bearer = (token: string | undefined) =>
  token ? { Authorization: `Bearer ${token}` } : undefined

/**
 * A second indexer with a quota of its own, asked only while the main one answers 429. Unset, the
 * route behaves exactly as it does without one.
 */
const ENVIO_FALLBACK: ProxyUpstream | undefined = process.env.ENVIO_INDEXER_FALLBACK_URL
  ? {
      upstream: process.env.ENVIO_INDEXER_FALLBACK_URL,
      headers: bearer(process.env.ENVIO_INDEXER_FALLBACK_TOKEN),
    }
  : undefined

const normalize = (query: string) => query.replace(/\s+/g, ' ').trim()

/**
 * Each allowed document by its normalized text, with the document itself: that is what goes
 * upstream, never the caller's copy. `\s` folds more than the whitespace the indexer's parser
 * skips (no-break spaces, line separators), so a copy that matches here can still fail there, and
 * it would fail under the key the real document is cached and coalesced on.
 */
const ALLOWED_QUERIES = new Map<string, { document: string; policy: EnvioPolicy }>(
  ENVIO_QUERY_POLICY.map(([query, policy]) => {
    const document = String(query)
    return [normalize(document), { document, policy }]
  }),
)

// Batch operations, unknown documents and implausible variables are refused identically.
const denied: ProxyResolution = {
  ok: false,
  status: 403,
  body: { errors: [{ message: 'Operation not allowed' }] },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyJsonPost(req, res, (body) => {
    if (Array.isArray(body)) return denied

    const { query, variables } = (body ?? {}) as { query?: unknown; variables?: unknown }
    if (typeof query !== 'string') return denied

    const normalized = normalize(query)
    const allowed = ALLOWED_QUERIES.get(normalized)
    if (!allowed || !allowed.policy.accepts(variables)) return denied

    return {
      ok: true,
      upstream: ENVIO_URL,
      headers: bearer(ENVIO_TOKEN),
      fallback: ENVIO_FALLBACK,
      forwardBody: { query: allowed.document, variables },
      upstreamErrorMessage: 'Upstream indexer request failed',
      // The document alone does not identify an answer: every list, chart and search on the
      // explorer reuses one of these three documents and differs only in its variables. Key order
      // matters to `JSON.stringify`, which is why the policy pins it rather than tolerating it.
      cache: { key: `${normalized}|${JSON.stringify(variables ?? null)}`, ttl: allowed.policy.ttl },
    }
  })
}
