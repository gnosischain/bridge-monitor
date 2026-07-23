import type { NextApiRequest, NextApiResponse } from 'next'

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
 */

const ENVIO_URL = process.env.ENVIO_INDEXER_URL || 'http://localhost:8080/v1/graphql'

const ENVIO_TOKEN = process.env.ENVIO_INDEXER_TOKEN

const normalize = (query: string) => query.replace(/\s+/g, ' ').trim()

const ALLOWED_QUERIES = new Set(
  [ENVIO_TRANSACTIONS_QUERY, ENVIO_VALIDATORS_QUERY, ENVIO_VALIDATORS_ACTIVITY_QUERY].map((query) =>
    normalize(String(query)),
  ),
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ errors: [{ message: 'Method not allowed' }] })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ errors: [{ message: 'Invalid JSON body' }] })
    }
  }

  if (Array.isArray(body)) {
    return res.status(403).json({ errors: [{ message: 'Operation not allowed' }] })
  }

  const query = body?.query
  if (typeof query !== 'string' || !ALLOWED_QUERIES.has(normalize(query))) {
    return res.status(403).json({ errors: [{ message: 'Operation not allowed' }] })
  }

  try {
    const upstream = await fetch(ENVIO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ENVIO_TOKEN ? { Authorization: `Bearer ${ENVIO_TOKEN}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const payload = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.send(payload)
  } catch {
    return res.status(502).json({ errors: [{ message: 'Upstream indexer request failed' }] })
  }
}
