import { Chains } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { ForeignBridgeErcToNative__factory } from '@/types/typechain'
import { USDS_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'
import { useReadContract } from 'wagmi'

export const useIsUsdsEnabled = () => {
  const { data: erc20Address } = useReadContract({
    address: contracts.XDAIBridge.address[Chains.mainnet],
    abi: ForeignBridgeErcToNative__factory.abi,
    functionName: 'erc20token',
    chainId: Chains.mainnet,
  })

  return isSameString(erc20Address, USDS_ADDRESS)
}
