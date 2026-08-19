import type { NextApiRequest, NextApiResponse } from 'next'

import { MAX_RPC_BATCH_SIZE } from '@/src/constants/config/rpc-providers'
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
 * Unlike the Envio proxy the payload is forwarded unchanged — a single JSON-RPC request or a batch
 * array (wagmi uses `batch: true`) — but no longer unconditionally: the request policy below caps
 * batch size and refuses methods the app never calls. The POST guard, body parsing and upstream
 * passthrough live in `proxyJsonPost`; this file maps `chainId` → upstream and declares that policy.
 */

const UPSTREAM_BY_CHAIN: Record<string, string | undefined> = {
  // Mainnet has no safe public fallback — it must be provided (the Tenderly gateway URL).
  '1': process.env.RPC_MAINNET,
  // Gnosis has a public node, so fall back to it when no private URL is configured.
  '100': process.env.RPC_GNOSIS || 'https://rpc.gnosischain.com/',
}

const DENIED_METHOD_PREFIX = /^(admin_|arbtrace_|debug_|engine_|miner_|tenderly_|trace_|txpool_)/

const DENIED_METHODS = new Set([
  'eth_getLogs',
  'eth_getProof',
  'eth_newFilter',
  'eth_newBlockFilter',
  'eth_newPendingTransactionFilter',
  'eth_getFilterChanges',
  'eth_getFilterLogs',
  'eth_uninstallFilter',
  'eth_subscribe',
  'eth_unsubscribe',
  'eth_sendRawTransaction',
])

const COUNTS_FLUSH_INTERVAL_MS = 60_000
const MAX_COUNTED_METHODS = 200
const MAX_COUNTED_KEY_LENGTH = 96
const OVERFLOW_KEY = 'other'

const methodCounts = new Map<string, number>()
let windowStartedAt = Date.now()

const flushCountsIfDue = () => {
  const windowMs = Date.now() - windowStartedAt
  if (windowMs < COUNTS_FLUSH_INTERVAL_MS) return

  const rpcMethodCounts = Object.fromEntries(methodCounts)
  methodCounts.clear()
  windowStartedAt = Date.now()

  console.log(
    JSON.stringify({
      severity: 'INFO',
      message: 'rpc method counts',
      rpcMethodCounts,
      rpcMethodCountsWindowMs: windowMs,
    }),
  )
}

const record = (key: string) => {
  const bounded = key.slice(0, MAX_COUNTED_KEY_LENGTH)
  const counted =
    methodCounts.has(bounded) || methodCounts.size < MAX_COUNTED_METHODS ? bounded : OVERFLOW_KEY
  methodCounts.set(counted, (methodCounts.get(counted) ?? 0) + 1)
  flushCountsIfDue()
}

const recordMethods = (chainId: string, methods: string[]) => {
  for (const method of methods) record(`${chainId}:${method}`)
}

const rejected = (counterKey: string, message: string): ProxyResolution => {
  record(`rejected:${counterKey}`)
  return { ok: false, status: 400, body: { errors: [{ message }] } }
}

const collectMethods = (body: unknown): string[] | ProxyResolution => {
  const calls = Array.isArray(body) ? body : [body]
  if (calls.length > MAX_RPC_BATCH_SIZE) return rejected('batch-too-large', 'Batch too large')

  const methods: string[] = []
  for (const call of calls) {
    const method = (call as { method?: unknown } | null)?.method
    if (typeof method !== 'string') return rejected('malformed', 'Malformed JSON-RPC request')
    if (DENIED_METHODS.has(method) || DENIED_METHOD_PREFIX.test(method)) {
      return rejected(`method:${method}`, 'Method not allowed')
    }
    methods.push(method)
  }

  return methods
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyJsonPost(req, res, (body, request) => {
    const chainId = Array.isArray(request.query.chainId)
      ? request.query.chainId[0]
      : request.query.chainId

    if (!chainId || !(chainId in UPSTREAM_BY_CHAIN)) {
      return rejected('unsupported-chain', 'Unsupported chainId')
    }

    const upstream = UPSTREAM_BY_CHAIN[chainId]
    if (!upstream) {
      // Chain is supported but the server was never given an upstream URL for it.
      return {
        ok: false,
        status: 502,
        body: { errors: [{ message: 'RPC upstream not configured' }] },
      }
    }

    const methods = collectMethods(body)
    if (!Array.isArray(methods)) return methods

    recordMethods(chainId, methods)

    return { ok: true, upstream, upstreamErrorMessage: 'Upstream RPC request failed' }
  })
}
