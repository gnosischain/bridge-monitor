import { useEffect, useMemo, useState } from 'react'
import { ChainsValues } from '@/src/constants/config/types'
import { Hash } from 'viem'
import { useTransactionConfirmations } from 'wagmi'
import { useBridgeRequiredBlocks } from '@/src/hooks/bridge/useBridgeRequiredBlocks'

const POLLING_INTERVAL = 5_000

export const useBridgeProgress = (
  chainId: ChainsValues,
  isNativeBridge: boolean,
  transactionId: string,
) => {
  const [shouldPolling, setShouldPolling] = useState(true)

  const { data: bridgeBlockInfo, isLoading: isLoadingBlockInfo } = useBridgeRequiredBlocks(
    chainId,
    isNativeBridge,
  )

  // single co-located read (getBlockNumber + getTransaction in one Promise.all), so the block
  // height and the tx's block come from the same snapshot. Only runs once bridgeBlockInfo is defined.
  const { data: rawConfirmations, isLoading: isLoadingConfirmations } = useTransactionConfirmations({
    hash: transactionId as Hash,
    chainId,
    query: {
      enabled: !!bridgeBlockInfo,
      refetchInterval: shouldPolling ? POLLING_INTERVAL : false,
      // a not-yet-propagated tx makes getTransaction throw; keep polling instead of retrying
      retry: false,
    },
  })

  const progressData = useMemo(() => {
    if (!bridgeBlockInfo || rawConfirmations === undefined) return undefined

    const { estimatedTimeInSeconds, requiredBlocks } = bridgeBlockInfo
    // viem returns 0 for an unmined tx and counts the inclusion block as confirmation #1
    const isMined = rawConfirmations > 0n
    // drop viem's +1 so 0 means "just mined"; clamp guards against a lagging node reading below the tx block
    const blocksSinceMined = Math.max(0, Number(rawConfirmations) - 1)

    let progress: number
    if (blocksSinceMined > requiredBlocks) {
      progress = 100
    } else {
      // progress in percentage
      progress = Math.round((blocksSinceMined / requiredBlocks) * 100)
    }

    return {
      isMined,
      progress,
      confirmations: blocksSinceMined, // legacy field name kept for consumers
      requiredBlocks,
      estimatedTimeInSeconds,
    }
  }, [bridgeBlockInfo, rawConfirmations])

  // stop polling when the progress is 100%
  useEffect(() => {
    if (progressData?.progress === 100) {
      setShouldPolling(false)
    }
  }, [progressData?.progress])

  return {
    isLoading: isLoadingBlockInfo || isLoadingConfirmations,
    progressData,
  }
}

export default useBridgeProgress
