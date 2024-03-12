import { useState } from 'react'
import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { chainsConfig } from '@/src/constants/config/chains'
import { JsonRpcProvider } from '@ethersproject/providers'
import { useBridgeRequiredBlocks } from '@/src/hooks/bridge/useBridgeRequiredBlocks'

export const useBridgeProgress = (
  chainId: ChainsValues,
  isNativeBridge: boolean,
  transactionId: string,
) => {
  const provider = new JsonRpcProvider(chainsConfig[chainId].rpcUrl)
  const [shouldPolling, setShouldPolling] = useState(true)

  const { data: bridgeBlockInfo, isLoading: isLoadingBlockInfo } = useBridgeRequiredBlocks(
    chainId,
    isNativeBridge,
  )

  // get the progress of the transaction. It will be updated every 5 seconds
  // to run this fetcher, the bridgeBlockInfo must be defined
  const {
    data: progressData,
    isLoading,
    mutate,
  } = useSWR(
    bridgeBlockInfo ? ['bridgeProgress', transactionId, bridgeBlockInfo] : null,
    async ([, _transactionId, _bridgeBlockInfo]) => {
      let tx
      try {
        tx = await provider.getTransaction(_transactionId)
      } catch (error) {
        console.log('tx', tx)
      }

      const currentBlock = await provider.getBlockNumber()
      const { estimatedTimeInSeconds, requiredBlocks } = _bridgeBlockInfo
      // blocks since the transaction was mined
      // confirmations always >= 0
      let confirmations = 0
      if (tx?.blockNumber) {
        confirmations = currentBlock - tx.blockNumber
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
    },

    {
      suspense: false,
      refreshInterval: shouldPolling ? 5000 : 0,
      onSuccess: ({ progress }) => {
        // stop polling when the progress is 100%
        if (progress === 100) {
          setShouldPolling(false)
        }
      },
    },
  )

  return {
    isLoading: isLoading || isLoadingBlockInfo,
    progressData,
    mutate,
  }
}

export default useBridgeProgress
