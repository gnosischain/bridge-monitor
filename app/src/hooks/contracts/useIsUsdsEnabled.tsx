import { useReadContract } from 'wagmi'

import { Chains } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { USDS_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'

export const useIsUsdsEnabled = () => {
  const { data } = useReadContract({
    address: contracts.foreignXDAIBridge.address[Chains.mainnet],
    abi: contracts.foreignXDAIBridge.abi,
    functionName: 'erc20token',
    chainId: Chains.mainnet,
  })

  return isSameString(data, USDS_ADDRESS)
}
