import type { NextApiRequest, NextApiResponse } from 'next'

import { ProxyResolution, proxyJsonPost } from '@/src/lib/api/proxyJsonPost'
import { ENVIO_TRANSACTIONS_QUERY } from '@/src/queries/transactions'
import { ENVIO_VALIDATORS_ACTIVITY_QUERY, ENVIO_VALIDATORS_QUERY } from '@/src/queries/validators'

/**
 * Server-side proxy for the Envio GraphQL indexer.
 *
 * The browser talks to this same-origin route instead of the indexer directly, so:
 *  - the real indexer URL never ships in the client bundle;
 *  - the API-key/bearer token stays server-only (never exposed to the browser);
 *  - only the exact GraphQL documents the app ships are forwarded (allow-list below),
 *    which blocks arbitrary schema scraping, introspection and mutations.
 *
 * The POST guard, body parsing and upstream passthrough live in `proxyJsonPost`;
 * this file only declares the Envio-specific policy (allow-list + upstream + token).
 */

const ENVIO_URL = process.env.ENVIO_INDEXER_URL || 'http://localhost:8080/v1/graphql'

const ENVIO_TOKEN = process.env.ENVIO_INDEXER_TOKEN

const normalize = (query: string) => query.replace(/\s+/g, ' ').trim()

const ALLOWED_QUERIES = new Set(
  [ENVIO_TRANSACTIONS_QUERY, ENVIO_VALIDATORS_QUERY, ENVIO_VALIDATORS_ACTIVITY_QUERY].map((query) =>
    normalize(String(query)),
  ),
)

// Batch operations and anything outside the allow-list are refused identically.
const denied: ProxyResolution = {
  ok: false,
  status: 403,
  body: { errors: [{ message: 'Operation not allowed' }] },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyJsonPost(req, res, (body) => {
    if (Array.isArray(body)) return denied

    const query = (body as { query?: unknown } | null)?.query
    if (typeof query !== 'string' || !ALLOWED_QUERIES.has(normalize(query))) return denied

    return {
      ok: true,
      upstream: ENVIO_URL,
      headers: ENVIO_TOKEN ? { Authorization: `Bearer ${ENVIO_TOKEN}` } : undefined,
      upstreamErrorMessage: 'Upstream indexer request failed',
    }
  })
}
