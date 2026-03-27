import { ChainsValues } from '@/src/constants/config/types'
import { contracts } from '@/src/constants/config/contracts'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { useReadContract } from 'wagmi'

export const useBridgeRequiredBlocks = (chainId: ChainsValues, isNativeBridge: boolean) => {
  const chainConfig = getNetworkConfig(chainId)

  const { data: blocks, isLoading } = useReadContract({
    address: (isNativeBridge
      ? contracts.XDAIBridge.address[chainId]
      : contracts.AMB.address[chainId]) as `0x${string}`,
    abi: isNativeBridge ? contracts.XDAIBridge.abi : contracts.AMB.abi,
    functionName: 'requiredBlockConfirmations',
    chainId,
  })

  if (!blocks) return { data: undefined, isLoading }

  return {
    data: {
      requiredBlocks: Number(blocks),
      estimatedTimeInSeconds: Number(blocks) * chainConfig.blocksFrequencyInSeconds,
    },
    isLoading,
  }
}
