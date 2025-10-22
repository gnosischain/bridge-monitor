import { useContractInstance } from '@/src/hooks/useContractInstance'
import { Chains } from '@/src/constants/config/chains'
import { ForeignBridgeErcToNative, ForeignBridgeErcToNative__factory } from '@/types/typechain'
import { useContractCall } from '@/src/hooks/useContractCall'
import { USDS_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'
import { useMemo } from 'react'

export const useIsUsdsEnabled = () => {
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

  console.log('foreignXDAIContext', foreignXDAIContext)

  const isUsdsEnabled = useMemo(
    () => isSameString(foreignXDAIContext?.[0], USDS_ADDRESS),
    [foreignXDAIContext],
  )

  return isUsdsEnabled
}
