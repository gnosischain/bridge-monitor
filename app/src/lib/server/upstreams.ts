import { Chains, type ChainsValues } from '@/src/constants/config/types'

/**
 * Single source of truth for the app's server-side JSON-RPC upstreams.
 *
 * Both server RPC consumers resolve their upstream here so the env contract can't drift:
 *  - the browser-facing proxy (`pages/api/rpc.ts`), which forwards raw JSON-RPC, and
 *  - the direct viem clients (`src/lib/server/rpc.ts`), which issue specific reads.
 *
 * The upstream URLs (the Tenderly mainnet gateway, whose URL embeds an access key) are read
 * from `process.env.RPC_*` and must stay server-side — import this only from `pages/api/*` or
 * other server code, never from a component.
 */

// Private URLs, with a public Gnosis node as the fallback (mainnet has no safe public fallback —
// it must be provided).
const UPSTREAM_BY_CHAIN: Partial<Record<ChainsValues, string>> = {
  [Chains.mainnet]: process.env.RPC_MAINNET,
  [Chains.gnosis]: process.env.RPC_GNOSIS || 'https://rpc.gnosischain.com/',
}

/** Narrows an arbitrary numeric chainId to one these upstreams can serve. */
export const isSupportedServerChain = (chainId: number): chainId is ChainsValues =>
  chainId === Chains.mainnet || chainId === Chains.gnosis

/**
 * Configured upstream URL for a supported chain, or `undefined` when the chain is supported but
 * no URL was provided (e.g. `RPC_MAINNET` unset). Callers distinguish this from an unsupported
 * chain via `isSupportedServerChain`.
 */
export const getUpstreamUrl = (chainId: ChainsValues): string | undefined =>
  UPSTREAM_BY_CHAIN[chainId]
