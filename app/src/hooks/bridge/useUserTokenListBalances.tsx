import useSWR from 'swr'
import { Address } from 'viem'

import { fetchUserTokenBalances } from '@/src/lib/api/fetchUserTokenBalances'

/**
 * A user's ERC-20 balances for the given token list, via our `/api/user/token-balances`
 * endpoint (server-side Multicall).
 *
 * `fetchUserTokenBalances` is the pure transport (returns the raw response). This hook owns the
 * SWR wiring — cache key + gating — and converts the string balances to `bigint` inside the
 * fetcher, so SWR caches the final shape: a map of non-zero balances keyed by token address.
 */
export const useUserTokenListBalances = ({
  chainId,
  tokens,
  userAddress,
}: {
  userAddress: Address | null
  chainId: number
  tokens: string[]
}) => {
  return useSWR(
    // Key is null (SWR skips the fetch) until we have both an address and tokens — so the
    // fetcher only runs when `userAddress` is non-null, making the assertion below safe.
    // Key on the token contents (not just the count) so a same-length list swap still refetches;
    // `tokens` is a memoized, stably-ordered array from the caller, so the join is cheap and stable.
    userAddress && tokens.length
      ? ['tokenUserBalances', userAddress, chainId, tokens.join(',')]
      : null,
    async (): Promise<Record<string, bigint>> => {
      const { balances } = await fetchUserTokenBalances({ address: userAddress!, chainId, tokens })

      return Object.fromEntries(
        Object.entries(balances).map(([token, value]) => [token, BigInt(value)]),
      )
    },
  )
}
