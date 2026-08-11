import { useMemo } from 'react'
import { Address, erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { isNativeToken } from '@/src/utils/tools'

const MULTICALL_BATCH_SIZE = 4_096

/**
 * Reads the user's ERC-20 balance for every token in `tokenAddresses` through
 * Multicall3, using the RPC configured in the wagmi transports.
 *
 * @returns balances keyed by lower-cased token address; tokens with a zero
 * balance are omitted.
 */
export const useUserTokenListBalances = ({
  chainId,
  enabled = true,
  tokenAddresses,
  userAddress,
}: {
  userAddress: string | null
  chainId: number
  tokenAddresses: Array<string>
  enabled?: boolean
}) => {
  // the native token has no `balanceOf`, so it is left out of the reads
  const addresses = useMemo(
    () => [
      ...new Set(
        tokenAddresses
          .filter((address) => !isNativeToken(address))
          .map((address) => address.toLowerCase() as Address),
      ),
    ],
    [tokenAddresses],
  )

  const { data, isLoading } = useReadContracts({
    allowFailure: true,
    batchSize: MULTICALL_BATCH_SIZE,
    contracts: addresses.map((address) => ({
      abi: erc20Abi,
      address,
      args: [userAddress as Address],
      chainId,
      functionName: 'balanceOf',
    })),
    query: {
      enabled: enabled && !!userAddress && addresses.length > 0,
    },
  })

  const balances = useMemo(() => {
    if (!data) return undefined

    return data.reduce<Record<string, bigint>>((acc, result, index) => {
      // a token that fails to answer (not an ERC-20, self-destructed, ...) is skipped
      if (result.status !== 'success') return acc

      const balance = result.result as bigint
      if (balance > 0n) acc[addresses[index]] = balance

      return acc
    }, {})
  }, [data, addresses])

  return { data: balances, isLoading }
}
