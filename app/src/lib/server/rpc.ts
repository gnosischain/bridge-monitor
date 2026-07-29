import { type Chain, type PublicClient, createPublicClient, http } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import { Chains, type ChainsValues } from '@/src/constants/config/types'

/**
 * Server-only JSON-RPC access for the app's API routes.
 *
 * This is the private successor to the browser-facing `/api/rpc` proxy. Instead of
 * forwarding arbitrary JSON-RPC on behalf of the client, our own API routes import
 * these viem clients and issue only the specific reads they need — so the upstream can
 * never be driven with an attacker-chosen method or target. The upstream URLs (the
 * Tenderly mainnet gateway, whose URL embeds an access key) stay server-side and never
 * reach the client bundle.
 *
 * IMPORTANT: import this only from `pages/api/*` (or other server code), never from a
 * component — it reads `process.env.RPC_*`, which must not be bundled to the browser.
 */

// Same env contract as the proxy (`pages/api/rpc.ts`): private URLs, with a public
// Gnosis node as the fallback (mainnet has no safe public fallback — it must be set).
const UPSTREAM_BY_CHAIN: Partial<Record<ChainsValues, string>> = {
  [Chains.mainnet]: process.env.RPC_MAINNET,
  [Chains.gnosis]: process.env.RPC_GNOSIS || 'https://rpc.gnosischain.com/',
}

const VIEM_CHAIN: Partial<Record<ChainsValues, Chain>> = {
  [Chains.mainnet]: mainnet,
  [Chains.gnosis]: gnosis,
}

// Clients are cheap but stateless-cacheable; the container stays warm, so memoize per chain.
const clients = new Map<ChainsValues, PublicClient>()

/** Narrows an arbitrary numeric chainId to one this module can serve. */
export const isSupportedServerChain = (chainId: number): chainId is ChainsValues =>
  chainId === Chains.mainnet || chainId === Chains.gnosis

/** Returns a memoized viem public client for a supported chain, or throws if unconfigured. */
export const getServerClient = (chainId: ChainsValues): PublicClient => {
  const cached = clients.get(chainId)
  if (cached) return cached

  const chain = VIEM_CHAIN[chainId]
  const upstream = UPSTREAM_BY_CHAIN[chainId]
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
