import type { NextApiRequest, NextApiResponse } from 'next'

import { Upstream, fetchCached } from '@/src/lib/api/graphqlCache'
import { ENVIO_TRANSACTIONS_QUERY } from '@/src/queries/transactions'
import { ENVIO_VALIDATORS_ACTIVITY_QUERY, ENVIO_VALIDATORS_QUERY } from '@/src/queries/validators'

/**
 * Server-side proxy for the Envio GraphQL indexer.
 *
 * The browser talks to this same-origin route instead of the indexer directly, so:
 *  - the real indexer URL never ships in the client bundle;
 *  - the API-key/bearer token stays server-only (never exposed to the browser);
 *  - only the exact GraphQL documents the app ships are forwarded (allow-list below),
 *    which blocks arbitrary schema scraping, introspection and mutations;
 *  - visitors asking the same question share one indexer request, and a fallback indexer
 *    answers while the main one is rate-limiting (`graphqlCache`).
 *
 * Unlike `/api/rpc`, it does not go through `proxyJsonPost`: its answers may come from a
 * cache, while RPC calls (nonce reads, gas estimates, broadcasts) must always reach their
 * provider.
 */

const bearer = (token: string | undefined) =>
  token ? { Authorization: `Bearer ${token}` } : undefined

const ENVIO: Upstream = {
  name: 'indexer',
  url: process.env.ENVIO_INDEXER_URL || 'http://localhost:8080/v1/graphql',
  headers: bearer(process.env.ENVIO_INDEXER_TOKEN),
}

/** A second indexer with a quota of its own, asked only while the main one answers 429. */
const ENVIO_FALLBACK: Upstream | undefined = process.env.ENVIO_INDEXER_FALLBACK_URL
  ? {
      name: 'fallback indexer',
      url: process.env.ENVIO_INDEXER_FALLBACK_URL,
      headers: bearer(process.env.ENVIO_INDEXER_FALLBACK_TOKEN),
    }
  : undefined

const normalize = (query: string) => query.replace(/\s+/g, ' ').trim()

/**
 * The allowed documents by normalized text, each with how long an answer to it may be reused
 * (`useFetchTransactions` matches its `staleTime` to the transactions one).
 */
const ALLOWED_QUERIES = new Map(
  [
    { query: ENVIO_TRANSACTIONS_QUERY, ttl: 10_000 },
    { query: ENVIO_VALIDATORS_QUERY, ttl: 30_000 },
    { query: ENVIO_VALIDATORS_ACTIVITY_QUERY, ttl: 30_000 },
  ].map(({ query, ttl }) => [normalize(String(query)), { document: String(query), ttl }] as const),
)

const errorBody = (message: string) => ({ errors: [{ message }] })

// Batch operations and anything outside the allow-list are refused identically.
const DENIED = errorBody('Operation not allowed')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  if (Array.isArray(body)) return res.status(403).json(DENIED)

  const { query, variables } = (body ?? {}) as { query?: unknown; variables?: unknown }
  if (typeof query !== 'string') return res.status(403).json(DENIED)

  const allowed = ALLOWED_QUERIES.get(normalize(query))
  if (!allowed) return res.status(403).json(DENIED)

  try {
    // Serialized here, where a failure (variables nested too deep) is this request's 502 alone,
    // not an indexer failure that would pause the indexer for everyone. Our copy of the document,
    // not the caller's: `normalize` folds more whitespace than the indexer's parser skips.
    const answer = await fetchCached({
      body: JSON.stringify({ query: allowed.document, variables }),
      ttl: allowed.ttl,
      upstream: ENVIO,
      fallback: ENVIO_FALLBACK,
    })

    res.status(answer.status)
    res.setHeader('Content-Type', answer.contentType)
    return res.send(answer.payload)
  } catch {
    return res.status(502).json(errorBody('Upstream indexer request failed'))
  }
}
