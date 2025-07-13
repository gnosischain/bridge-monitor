import { useContractInstance } from '../useContractInstance'
import { Chains } from '@/src/constants/config/chains'
import { ForeignBridgeErcToNative, ForeignBridgeErcToNative__factory } from '@/types/typechain'
import { useContractCall } from '../useContractCall'

export const useForeignXdaiErc20Address = () => {
  const foreignXDAI = useContractInstance(
    ForeignBridgeErcToNative__factory,
    'XDAIBridge',
    Chains.mainnet,
  )

  const erc20AddressCalls = [foreignXDAI.erc20token] as const
  const [{ data: foreignXDAIContext }] = useContractCall<
    ForeignBridgeErcToNative,
    typeof erc20AddressCalls
  >(erc20AddressCalls, [[]], 'foreignXDAIContext')

  return {
    foreignXdaiErc20Token: foreignXDAIContext?.[0],
  }
}
