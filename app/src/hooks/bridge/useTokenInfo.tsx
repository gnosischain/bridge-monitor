import { Chains, ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr/immutable'
import { erc20Abi } from 'viem'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { gnosisBatchClient, mainnetBatchClient } from '@/src/constants/config/rpc-providers'
import { Token } from '@/types/token'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { xdaiToken } from '@/src/constants/xdaiToken'

export const useTokenInfo = (tokenAddress: string, chainId: ChainsValues) => {
  const { tokensByAddress } = useBridgedTokens()

  return useSWR([chainId, tokenAddress], async ([_chainId, _token]) => {
    if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() && chainId === 100) {
      return xdaiToken
    }

    const token = tokensByAddress[_token.toLowerCase()]

    if (token) {
      return token
    }

    const client = _chainId === Chains.gnosis ? gnosisBatchClient : mainnetBatchClient

    try {
      const [name, symbol, decimals] = await Promise.all([
        client.readContract({
          address: _token as `0x${string}`,
          abi: erc20Abi,
          functionName: 'name',
        }),
        client.readContract({
          address: _token as `0x${string}`,
          abi: erc20Abi,
          functionName: 'symbol',
        }),
        client.readContract({
          address: _token as `0x${string}`,
          abi: erc20Abi,
          functionName: 'decimals',
        }),
      ])

      return {
        name,
        symbol,
        decimals,
        extensions: {
          bridgeInfo: {
            1: { tokenAddress: chainId === 1 ? tokenAddress : '' },
            100: { tokenAddress: chainId === 100 ? tokenAddress : '' },
          },
        },
      } as Token
    } catch (error) {
      console.error('Error fetching token info', error)
      return null
    }
  })
}
