import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr/immutable'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { chainsConfig } from '@/src/constants/config/chains'
import { ERC20__factory } from '@/types/typechain'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { Token } from '@/types/token'

export const useTokenInfo = (tokenAddress: string, chainId: ChainsValues) => {
  const { tokensByAddress } = useBridgedTokens()

  return useSWR([chainId, tokenAddress], async ([_chainId, _token]) => {
    const provider = new JsonRpcBatchProvider(chainsConfig[_chainId].rpcUrl)
    const tokenContract = ERC20__factory.connect(_token, provider)

    const token = tokensByAddress[_token.toLowerCase()]

    if (token) {
      return token
    }

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
      } as Token
    } catch (error) {
      console.error('Error fetching token info', error)
      return null
    }
  })
}
