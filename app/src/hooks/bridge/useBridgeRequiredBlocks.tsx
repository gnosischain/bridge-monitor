import { useMemo } from 'react'
import { useReadContract } from 'wagmi'

import { ChainsValues } from '@/src/constants/config/types'
import { contracts } from '@/src/constants/config/contracts'

export const useBridgeRequiredBlocks = (chainId: ChainsValues, isNativeBridge: boolean) => {
  const { data: requiredBlocks, isLoading } = useReadContract({
    address: isNativeBridge
      ? contracts.XDAIBridge.address[chainId]
      : contracts.AMB.address[chainId],
    abi: isNativeBridge ? contracts.XDAIBridge.abi : contracts.AMB.abi,
    functionName: 'requiredBlockConfirmations',
    chainId,
    query: { staleTime: Infinity },
  })

  const data = useMemo(
    () => (requiredBlocks !== undefined ? { requiredBlocks: Number(requiredBlocks) } : undefined),
    [requiredBlocks],
  )

  return { data, isLoading }
}
