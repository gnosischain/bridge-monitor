import { useMemo } from 'react'
import { ChainsValues } from '@/src/constants/config/types'
import { useBridgeRequiredBlocks } from '@/src/hooks/bridge/useBridgeRequiredBlocks'
import { useBlockNumber, useTransaction } from 'wagmi'

export const useBridgeProgress = (
  chainId: ChainsValues,
  isNativeBridge: boolean,
  transactionId: string,
) => {
  const { data: bridgeBlockInfo, isLoading: isLoadingBlockInfo } = useBridgeRequiredBlocks(
    chainId,
    isNativeBridge,
  )

  const { data: tx, isLoading: isLoadingTx } = useTransaction({
    hash: transactionId as `0x${string}`,
    chainId,
    query: { enabled: !!transactionId && !!bridgeBlockInfo },
  })

  const { data: blockNumber, isLoading: isLoadingBlock } = useBlockNumber({
    chainId,
    watch: !!tx?.blockNumber,
    query: { enabled: !!tx?.blockNumber },
  })

  const finalProgressData = useMemo(() => {
    if (!bridgeBlockInfo) return undefined
    const { estimatedTimeInSeconds, requiredBlocks } = bridgeBlockInfo

    let confirmations = 0
    if (tx?.blockNumber && blockNumber) {
      confirmations = Number(blockNumber - tx.blockNumber)
    }

    const progress =
      confirmations > requiredBlocks ? 100 : Math.round((confirmations / requiredBlocks) * 100)

    return {
      isMined: !!tx?.blockNumber,
      progress,
      confirmations,
      requiredBlocks,
      estimatedTimeInSeconds,
    }
  }, [bridgeBlockInfo, tx?.blockNumber, blockNumber])

  return {
    isLoading: isLoadingBlockInfo || isLoadingTx || isLoadingBlock,
    progressData: finalProgressData,
  }
}

export default useBridgeProgress
