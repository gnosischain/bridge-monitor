import { useMemo } from 'react'
import { useReadContract } from 'wagmi'

import { ChainsValues } from '@/src/constants/config/types'
import { contracts } from '@/src/constants/config/contracts'
import { getNetworkConfig } from '@/src/constants/config/chains'

export const useBridgeRequiredBlocks = (chainId: ChainsValues, isNativeBridge: boolean) => {
  const chainConfig = getNetworkConfig(chainId)

  const { data: requiredBlocks, isLoading } = useReadContract({
    address: isNativeBridge
      ? contracts.XDAIBridge.address[chainId]
      : contracts.AMB.address[chainId],
    abi: isNativeBridge ? contracts.XDAIBridge.abi : contracts.AMB.abi,
    functionName: 'requiredBlockConfirmations',
    chainId,
  })

  const data = useMemo(
    () =>
      requiredBlocks !== undefined
        ? {
            requiredBlocks: Number(requiredBlocks),
            estimatedTimeInSeconds: Number(requiredBlocks) * chainConfig.blocksFrequencyInSeconds,
          }
        : undefined,
    [requiredBlocks, chainConfig.blocksFrequencyInSeconds],
  )

  return { data, isLoading }
}
