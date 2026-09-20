import type { NextApiRequest, NextApiResponse } from 'next'

import { ENVIO_QUERY_POLICY, EnvioPolicy } from '@/src/lib/api/envioQueryPolicy'
import { ProxyResolution, proxyJsonPost } from '@/src/lib/api/proxyJsonPost'

/**
 * Server-side proxy for the Envio GraphQL indexer.
 *
 * The browser talks to this same-origin route instead of the indexer directly, so:
 *  - the real indexer URL never ships in the client bundle;
 *  - the API-key/bearer token stays server-only (never exposed to the browser);
 *  - only the exact GraphQL documents the app ships are forwarded, asked only with
 *    variables the app could have produced (`ENVIO_QUERY_POLICY`)
 *  - visitors asking the same question share one upstream request.
 *
 * The POST guard, body parsing and caching live in `proxyJsonPost`;
 * this file declares the Envio-specific policy and `envioQueryPolicy` the per-document
 * shape of a legitimate request.
 */

const ENVIO_URL = process.env.ENVIO_INDEXER_URL || 'http://localhost:8080/v1/graphql'

const ENVIO_TOKEN = process.env.ENVIO_INDEXER_TOKEN

const normalize = (query: string) => query.replace(/\s+/g, ' ').trim()

const ALLOWED_QUERIES = new Map<string, EnvioPolicy>(
  ENVIO_QUERY_POLICY.map(([query, policy]) => [normalize(String(query)), policy]),
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
    const policy = ALLOWED_QUERIES.get(normalized)
    if (!policy || !policy.accepts(variables)) return denied

    return {
      ok: true,
      upstream: ENVIO_URL,
      headers: ENVIO_TOKEN ? { Authorization: `Bearer ${ENVIO_TOKEN}` } : undefined,
      upstreamErrorMessage: 'Upstream indexer request failed',
      // The document alone does not identify an answer: every list, chart and search on the
      // explorer reuses one of these three documents and differs only in its variables. Key order
      // matters to `JSON.stringify`.
      cache: { key: `${normalized}|${JSON.stringify(variables ?? null)}`, ttl: policy.ttl },
    }
  })
}
