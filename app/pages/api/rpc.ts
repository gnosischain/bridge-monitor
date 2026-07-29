import type { NextApiRequest, NextApiResponse } from 'next'

import { proxyJsonPost } from '@/src/lib/api/proxyJsonPost'
import { getUpstreamUrl, isSupportedServerChain } from '@/src/lib/server/upstreams'

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
 * in `proxyJsonPost`; the chainId → upstream mapping lives in `@/src/lib/server/upstreams`,
 * shared with the direct viem clients so the env contract can't drift.
 */

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyJsonPost(req, res, (_body, request) => {
    const rawChainId = Array.isArray(request.query.chainId)
      ? request.query.chainId[0]
      : request.query.chainId
    const chainId = Number(rawChainId)

    if (!rawChainId || !isSupportedServerChain(chainId)) {
      return { ok: false, status: 400, body: { errors: [{ message: 'Unsupported chainId' }] } }
    }

    const upstream = getUpstreamUrl(chainId)
    if (!upstream) {
      // Chain is supported but the server was never given an upstream URL for it.
      return {
        ok: false,
        status: 502,
        body: { errors: [{ message: 'RPC upstream not configured' }] },
      }
    }

    return { ok: true, upstream, upstreamErrorMessage: 'Upstream RPC request failed' }
  })
}
