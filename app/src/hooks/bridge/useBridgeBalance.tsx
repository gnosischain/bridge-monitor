import { BigNumber } from 'ethers'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { MAX_UINT_256 } from '@/src/constants/misc'
import { ERC20__factory } from '@/types/typechain'
import { ChainsValues } from '@/src/constants/config/types'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { JsonRpcBatchProvider } from '@ethersproject/providers'

export const useBridgeBalance = ({
  fromBridgeAddress,
  fromChainId,
  isNativeToken,
  toChainId,
  token,
}: {
  isNativeToken: boolean
  fromBridgeAddress?: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token?: Token
}) => {
  const { address } = useWeb3Connection()
  const shouldFetch = address && token && fromBridgeAddress

  return useSWR(
    shouldFetch ? [address, token, isNativeToken, fromBridgeAddress, 'bridgeBalance'] : null,
    async ([_account, _token, _isNativeToken, _fromBridgeAddress]) => {
      const fromRpcProvider = new JsonRpcBatchProvider(getNetworkConfig(fromChainId).rpcUrl)
      try {
        if (!_isNativeToken) {
          const erc20 = ERC20__factory.connect(_token.address, fromRpcProvider)

          const balances = await Promise.all([
            erc20.balanceOf(_account),
            erc20.allowance(_account, _fromBridgeAddress),
          ])

          const [balance, allowance] = balances

          return {
            balance,
            allowance,
          }
        } else {
          const nativeBalance = await fromRpcProvider.getBalance(_account)

          return {
            balance: nativeBalance,
            allowance: MAX_UINT_256,
          }
        }
      } catch (error) {
        console.error(error)

        return {
          balance: BigNumber.from(0),
          allowance: BigNumber.from(0),
        }
      }
    },
    { suspense: false },
  )
}
