import { BigNumber } from 'ethers'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { MAX_UINT_256 } from '@/src/constants/misc'
import { ERC20__factory } from '@/types/typechain'

export const useBridgeBalance = ({
  fromBridgeAddress,
  isERC20,
  token,
}: {
  isERC20: boolean
  fromBridgeAddress?: string
  token?: Token
}) => {
  const { address, readOnlyAppBatchProvider, web3Provider } = useWeb3Connection()
  const shouldFetch = address && token && fromBridgeAddress && web3Provider

  return useSWR(
    shouldFetch
      ? [address, token, isERC20, fromBridgeAddress, web3Provider, 'bridgeBalance']
      : null,
    async ([_account, _token, _isERC20, _fromBridgeAddress, _web3Provider]) => {
      try {
        if (_isERC20) {
          const erc20 = ERC20__factory.connect(_token.address, readOnlyAppBatchProvider)

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
          if (!_web3Provider) {
            throw new Error('No signer found')
          }
          const signer = await _web3Provider.getSigner()
          const nativeBalance = await signer.getBalance()

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
