import { useEffect, useMemo, useState } from 'react'
import { ChainsValues } from '@/src/constants/config/types'
import { Hash } from 'viem'
import { useBlockNumber, useTransaction } from 'wagmi'
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

  // both reads poll every 5 seconds until the required confirmations are reached
  // they only run once bridgeBlockInfo is defined
  const { data: tx, isLoading: isLoadingTx } = useTransaction({
    hash: transactionId as Hash,
    chainId,
    query: {
      enabled: !!bridgeBlockInfo,
      refetchInterval: shouldPolling ? POLLING_INTERVAL : false,
      // a not-yet-propagated tx makes getTransaction throw; keep polling instead of retrying
      retry: false,
    },
  })

  const { data: currentBlock, isLoading: isLoadingBlock } = useBlockNumber({
    chainId,
    query: {
      enabled: !!bridgeBlockInfo,
      refetchInterval: shouldPolling ? POLLING_INTERVAL : false,
    },
  })

  const progressData = useMemo(() => {
    if (!bridgeBlockInfo || currentBlock === undefined) return undefined

    const { estimatedTimeInSeconds, requiredBlocks } = bridgeBlockInfo
    // blocks since the transaction was mined
    // confirmations always >= 0
    let confirmations = 0
    if (tx?.blockNumber) {
      confirmations = Number(currentBlock - tx.blockNumber)
    }

    let progress: number
    if (confirmations > requiredBlocks) {
      progress = 100
    } else {
      // progress in percentage
      progress = Math.round((confirmations / requiredBlocks) * 100)
    }

    return {
      isMined: !!tx?.blockNumber,
      progress,
      confirmations,
      requiredBlocks,
      estimatedTimeInSeconds,
    }
  }, [bridgeBlockInfo, currentBlock, tx?.blockNumber])

  // stop polling when the progress is 100%
  useEffect(() => {
    if (progressData?.progress === 100) {
      setShouldPolling(false)
    }
  }, [progressData?.progress])

  return {
    isLoading: isLoadingBlockInfo || isLoadingTx || isLoadingBlock,
    progressData,
  }
}

export default useBridgeProgress
