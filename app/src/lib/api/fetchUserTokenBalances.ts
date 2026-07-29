import { Address } from 'viem'

/**
 * POSTs to the `/api/user/token-balances` route (server-side Multicall) and returns its parsed
 * response: a map of non-zero balances keyed by token address, as decimal strings (bigint
 * isn't JSON-serialisable).
 *
 * Kept React-free (no hook) so it's unit-testable and reusable — pure transport. The SWR
 * wiring and the string→bigint conversion live in `useUserTokenListBalances`. The route
 * validates and brands the inputs (`isAddress`) at the boundary; `tokens` stays string[]
 * because it originates from the JSON token list (Token.address: string).
 */
export type UserTokenBalancesParams = {
  address: Address
  chainId: number
  tokens: string[]
}

export type UserTokenBalancesResponse = {
  balances: Record<string, string>
}

export const fetchUserTokenBalances = async ({
  address,
  chainId,
  tokens,
}: UserTokenBalancesParams): Promise<UserTokenBalancesResponse> => {
  const response = await fetch('/api/user/token-balances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, chainId, tokens }),
  })

  if (!response.ok) {
    throw new Error(`Failed to load token balances (${response.status})`)
  }

  return (await response.json()) as UserTokenBalancesResponse
}
