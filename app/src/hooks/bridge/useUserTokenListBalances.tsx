import useSWR from 'swr'
import { ZERO_BN } from '@/src/constants/misc'
import { ERC20__factory } from '@/types/typechain'
import { ChainsValues } from '@/src/constants/config/types'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { isNativeToken } from '@/src/utils/tools'
import { BigNumber } from 'ethers'
import { Token } from '@/types/token'

export const useUserTokenListBalances = ({
  chainId,
  tokenList,
  userAddress,
}: {
  userAddress: string | null
  chainId: ChainsValues
  tokenList: Token[]
}) => {
  return useSWR(
    tokenList.length > 0
      ? ['tokenUserBalances', userAddress, JSON.stringify(tokenList), chainId]
      : null,
    async () => {
      const fromRpcProvider = new JsonRpcBatchProvider(getNetworkConfig(chainId).rpcUrl)

      try {
        const balancePromises = tokenList.map(async (token) => {
          const _isNativeToken = isNativeToken(token.address)

          if (!userAddress || token.chainId !== chainId) {
            return {
              tokenAddress: token.address,
              balance: ZERO_BN,
            }
          }

          if (!_isNativeToken) {
            const erc20 = ERC20__factory.connect(token.address, fromRpcProvider)
            const balance = await erc20.balanceOf(userAddress)
            return {
              tokenAddress: token.address,
              balance,
            }
          } else {
            const nativeBalance = await fromRpcProvider.getBalance(userAddress)
            return {
              tokenAddress: token.address,
              balance: nativeBalance.gt(ZERO_BN) ? nativeBalance : ZERO_BN,
            }
          }
        })

        // Wait for all balance promises to resolve
        const balances = await Promise.all(balancePromises)
        return balances.reduce<Record<string, BigNumber>>((acc, { balance, tokenAddress }) => {
          acc[tokenAddress] = balance
          return acc
        }, {})
      } catch (error) {
        console.log('Error fetching user token balances', error)
        console.log('Params with error', {
          chainId,
          tokenList,
          userAddress,
        })
        // Return an object with token addresses as keys and ZERO_BN as values
        return tokenList.reduce<Record<string, BigNumber>>((acc, token) => {
          acc[token.address] = ZERO_BN
          return acc
        }, {})
      }
    },
  )
}
