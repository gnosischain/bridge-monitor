import { type Chain, type PublicClient, createPublicClient, http } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import { Chains, type ChainsValues } from '@/src/constants/config/types'
import { getUpstreamUrl } from '@/src/lib/server/upstreams'

/**
 * Server-only JSON-RPC access for the app's API routes.
 *
 * This is the private successor to the browser-facing `/api/rpc` proxy. Instead of
 * forwarding arbitrary JSON-RPC on behalf of the client, our own API routes import
 * these viem clients and issue only the specific reads they need — so the upstream can
 * never be driven with an attacker-chosen method or target. The upstream URLs come from
 * `@/src/lib/server/upstreams` (the shared, server-only source of truth).
 *
 * IMPORTANT: import this only from `pages/api/*` (or other server code), never from a
 * component — the upstreams read `process.env.RPC_*`, which must not be bundled to the browser.
 */

// Re-exported so callers can validate a chainId and build a client from the same module.
export { isSupportedServerChain } from '@/src/lib/server/upstreams'

const VIEM_CHAIN: Partial<Record<ChainsValues, Chain>> = {
  [Chains.mainnet]: mainnet,
  [Chains.gnosis]: gnosis,
}

// Clients are cheap but stateless-cacheable; the container stays warm, so memoize per chain.
const clients = new Map<ChainsValues, PublicClient>()

/** Returns a memoized viem public client for a supported chain, or throws if unconfigured. */
export const getServerClient = (chainId: ChainsValues): PublicClient => {
  const cached = clients.get(chainId)
  if (cached) return cached

  const chain = VIEM_CHAIN[chainId]
  const upstream = getUpstreamUrl(chainId)
  if (!chain || !upstream) {
    throw new Error(`No RPC upstream configured for chain ${chainId}`)
  }

  const client = createPublicClient({
    chain,
    transport: http(upstream, { batch: true }),
  }) as PublicClient

  clients.set(chainId, client)
  return client
}
