import type { NextApiRequest, NextApiResponse } from 'next'

import { RPC_MAX_BATCH } from '@/src/constants/config/rpc-providers'
import { ProxyResolution, proxyJsonPost } from '@/src/lib/api/proxyJsonPost'

/**
 * Server-side proxy for the app's upstream JSON-RPC providers.
 *
 * The browser's wagmi/viem transports talk to this same-origin route
 * (`/api/rpc?chainId=<id>`) instead of the provider directly, so:
 *  - the real RPC URL never ships in the client bundle — the mainnet upstream is
 *    a Tenderly gateway whose URL embeds an access key, which must stay server-only;
 *  - only a fixed set of `chainId`s is accepted, so the caller can never influence
 *    which upstream is contacted (no SSRF).
 *
 * Unlike the Envio proxy this is a transparent pass-through: the exact JSON-RPC
 * payload — a single request or a batch array (wagmi uses `batch: true`) — is
 * forwarded unchanged. The POST guard, body parsing and upstream passthrough live
 * in `proxyJsonPost`; this file declares the RPC-specific policy: `chainId` → upstream,
 * a batch-size cap and a method deny-list.
 */

const UPSTREAM_BY_CHAIN = new Map<string, string | undefined>([
  // Mainnet has no safe public fallback — it must be provided (the Tenderly gateway URL).
  ['1', process.env.RPC_MAINNET],
  // Gnosis has a public node, so fall back to it when no private URL is configured.
  ['100', process.env.RPC_GNOSIS || 'https://rpc.gnosischain.com/'],
])

const DENIED_PREFIX = /^(debug_|trace_|arbtrace_|tenderly_|txpool_|admin_|miner_|engine_)/

const DENIED_EXACT = new Set([
  'eth_getLogs',
  'eth_newFilter',
  'eth_newBlockFilter',
  'eth_newPendingTransactionFilter',
  'eth_getFilterChanges',
  'eth_getFilterLogs',
  'eth_uninstallFilter',
  'eth_subscribe',
  'eth_unsubscribe',
  'eth_getProof',
])

const isDenied = (method: string) => DENIED_PREFIX.test(method) || DENIED_EXACT.has(method)

const reject = (message: string): ProxyResolution => ({
  ok: false,
  status: 400,
  body: { errors: [{ message }] },
})

/**
 * The methods a payload carries — one entry for a single call, one per element for a batch — or
 * `null` if any element is not a JSON-RPC call object with a string `method`.
 */
const readMethods = (body: unknown): Array<string> | null => {
  const elements = Array.isArray(body) ? body : [body]
  const methods: Array<string> = []

  for (const element of elements) {
    const method =
      typeof element === 'object' && element !== null
        ? (element as { method?: unknown }).method
        : undefined

    if (typeof method !== 'string') return null
    methods.push(method)
  }

  return methods
}

/** Why to refuse this payload, or `null` to forward it. */
const inspect = (methods: Array<string>): string | null => {
  if (methods.length > RPC_MAX_BATCH) return 'Batch too large'

  if (methods.some(isDenied)) return 'RPC method not allowed'

  return null
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyJsonPost(req, res, (body, request) => {
    const chainId = Array.isArray(request.query.chainId)
      ? request.query.chainId[0]
      : request.query.chainId

    if (!chainId || !UPSTREAM_BY_CHAIN.has(chainId)) {
      return reject('Unsupported chainId')
    }

    const upstream = UPSTREAM_BY_CHAIN.get(chainId)
    if (!upstream) {
      // Chain is supported but the server was never given an upstream URL for it.
      return {
        ok: false,
        status: 502,
        body: { errors: [{ message: 'RPC upstream not configured' }] },
      }
    }

    const methods = readMethods(body)
    if (!methods) return reject('Malformed JSON-RPC payload')

    const rejection = inspect(methods)
    if (rejection) return reject(rejection)

    return { ok: true, upstream, upstreamErrorMessage: 'Upstream RPC request failed' }
  })
}
