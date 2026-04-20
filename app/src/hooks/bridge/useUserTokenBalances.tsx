import useSWR from 'swr'
import { ERC20__factory } from '@/types/typechain'
import { ChainsValues } from '@/src/constants/config/types'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { isNativeToken } from '@/src/utils/tools'
import { bnToBigInt } from '@/src/utils/bigNumber'
import { MAX_UINT_256 } from '@/src/constants/misc'

export const useUserTokenBalances = ({
  allowanceAddress,
  chainId,
  tokenAddress,
  userAddress,
}: {
  userAddress: string
  chainId: ChainsValues
  allowanceAddress?: string
  tokenAddress?: string
}) => {
  return useSWR(
    tokenAddress
      ? ['tokenUserBalance', userAddress, tokenAddress, allowanceAddress, chainId]
      : null,
    async ([, _address, _tokenAddress, _allowanceAddress, _chainId]) => {
      const _isNativeToken = isNativeToken(_tokenAddress)

      const fromRpcProvider = new JsonRpcBatchProvider(getNetworkConfig(_chainId).rpcUrl)

      try {
        if (!_isNativeToken) {
          const erc20 = ERC20__factory.connect(_tokenAddress, fromRpcProvider)

          if (_allowanceAddress) {
            const [balance, allowance] = await Promise.all([
              erc20.balanceOf(_address).then(bnToBigInt),
              erc20.allowance(_address, _allowanceAddress).then(bnToBigInt),
            ])
            return {
              balance,
              allowance,
            }
          } else {
            const balance = await erc20.balanceOf(_address).then(bnToBigInt)
            return {
              balance,
              allowance: MAX_UINT_256,
            }
          }
        } else {
          const gasPrice = await fromRpcProvider.getGasPrice().then(bnToBigInt)
          const conservativeGasLimit = 21000n // Adjust based on expected transaction complexity

          const nativeBalance = await fromRpcProvider.getBalance(_address).then(bnToBigInt)
          // Calculate the max sendable amount by subtracting the gas cost buffer from the balance
          const maxSendableAmount = nativeBalance - conservativeGasLimit * gasPrice

          return {
            balance: maxSendableAmount > 0n ? maxSendableAmount : 0n,
            allowance: MAX_UINT_256,
          }
        }
      } catch (error) {
        console.log('Error fetching user token balances', error)
        console.log('Params with error', {
          allowanceAddress,
          chainId,
          tokenAddress,
          userAddress,
        })
        return {
          balance: 0n,
          allowance: MAX_UINT_256,
        }
      }
    },
  )
}
