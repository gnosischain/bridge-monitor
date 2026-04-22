import { useReadContract } from 'wagmi'

import { Chains } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { USDS_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'

const foreignXDAIBridgeAbi = [
  {
    name: 'erc20token',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
] as const

export const useIsUsdsEnabled = () => {
  const { data } = useReadContract({
    address: contracts.XDAIBridge.address[Chains.mainnet],
    abi: foreignXDAIBridgeAbi,
    functionName: 'erc20token',
    chainId: Chains.mainnet,
  })

  return isSameString(data, USDS_ADDRESS)
}
