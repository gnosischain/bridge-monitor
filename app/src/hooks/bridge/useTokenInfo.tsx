import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr/immutable'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { chainsConfig } from '@/src/constants/config/chains'
import { ERC20__factory } from '@/types/typechain'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
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

    const provider = new JsonRpcBatchProvider(chainsConfig[_chainId].rpcUrl)
    const tokenContract = ERC20__factory.connect(_token, provider)

    try {
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
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
