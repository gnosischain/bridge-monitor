import useSWR from 'swr'
import { MAX_UINT_256 } from '@/src/constants/misc'
import { ERC20__factory } from '@/types/typechain'
import { ChainsValues } from '@/src/constants/config/types'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { isNativeToken } from '@/src/utils/tools'

export const useUserTokenBalances = ({
  allowanceAddress,
  chainId,
  tokenAddress,
  userAddress,
}: {
  userAddress: string
  allowanceAddress: string
  chainId: ChainsValues
  tokenAddress: string
}) => {
  return useSWR(
    ['tokenUserBalance', userAddress, tokenAddress, allowanceAddress, chainId],
    async ([, _address, _tokenAddress, _allowanceAddress, _chainId]) => {
      const _isNativeToken = isNativeToken(_tokenAddress)

      const fromRpcProvider = new JsonRpcBatchProvider(getNetworkConfig(_chainId).rpcUrl)

      if (!_isNativeToken) {
        const erc20 = ERC20__factory.connect(_tokenAddress, fromRpcProvider)

        const balances = await Promise.all([
          erc20.balanceOf(_address),
          erc20.allowance(_address, _allowanceAddress),
        ])

        const [balance, allowance] = balances

        return {
          balance,
          allowance,
        }
      } else {
        const nativeBalance = await fromRpcProvider.getBalance(_address)

        return {
          balance: nativeBalance,
          allowance: MAX_UINT_256,
        }
      }
    },
  )
}
