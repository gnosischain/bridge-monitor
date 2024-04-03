import useSWR from 'swr'
import { MAX_UINT_256, ZERO_BN } from '@/src/constants/misc'
import { ERC20__factory } from '@/types/typechain'
import { ChainsValues } from '@/src/constants/config/types'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { isNativeToken } from '@/src/utils/tools'
import { BigNumber } from 'ethers'

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
              erc20.balanceOf(_address),
              erc20.allowance(_address, _allowanceAddress),
            ])
            return {
              balance,
              allowance,
            }
          } else {
            const balance = await erc20.balanceOf(_address)
            return {
              balance,
              allowance: MAX_UINT_256,
            }
          }
        } else {
          const gasPrice = await fromRpcProvider.getGasPrice()
          const conservativeGasLimit = BigNumber.from('21000') // Adjust based on expected transaction complexity

          const nativeBalance = await fromRpcProvider.getBalance(_address)
          // Calculate the max sendable amount by subtracting the gas cost buffer from the balance
          const maxSendableAmount = nativeBalance.sub(conservativeGasLimit.mul(gasPrice))

          return {
            balance: maxSendableAmount.gt(ZERO_BN) ? maxSendableAmount : ZERO_BN,
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
          balance: ZERO_BN,
          allowance: MAX_UINT_256,
        }
      }
    },
  )
}
