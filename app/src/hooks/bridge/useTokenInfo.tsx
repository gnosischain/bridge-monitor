import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'

import { ChainsValues } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { Token } from '@/types/token'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { xdaiToken } from '@/src/constants/xdaiToken'
import { erc20Abi } from 'viem'

export const useTokenInfo = (tokenAddress: string, chainId: ChainsValues) => {
  const { tokensByAddress } = useBridgedTokens()

  const isNativeXdai =
    tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() && chainId === 100
  const tokenFromList = tokensByAddress[tokenAddress.toLowerCase()]
  const shouldFetchFromChain = !isNativeXdai && !tokenFromList

  const erc20Contract = {
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    chainId,
  } as const

  const {
    data: contractData,
    error,
    isLoading,
  } = useReadContracts({
    contracts: [
      { ...erc20Contract, functionName: 'name' },
      { ...erc20Contract, functionName: 'symbol' },
      { ...erc20Contract, functionName: 'decimals' },
    ],
    query: { enabled: shouldFetchFromChain },
  })

  const data = useMemo((): Token | null | undefined => {
    if (isNativeXdai) return xdaiToken
    if (tokenFromList) return tokenFromList
    if (!contractData) return undefined
    const [name, symbol, decimals] = contractData
    if (name.status === 'failure' || symbol.status === 'failure' || decimals.status === 'failure') {
      return null
    }
    return {
      name: name.result,
      symbol: symbol.result,
      decimals: decimals.result,
      address: tokenAddress,
      chainId,
      extensions: {
        bridgeInfo: {
          1: { tokenAddress: chainId === 1 ? tokenAddress : '' },
          100: { tokenAddress: chainId === 100 ? tokenAddress : '' },
        },
      },
    }
  }, [isNativeXdai, tokenFromList, contractData, chainId, tokenAddress])

  return { data, error, isLoading }
}
