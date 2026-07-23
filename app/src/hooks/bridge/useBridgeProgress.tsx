import { useEffect, useMemo, useRef, useState } from 'react'
import { ChainsValues } from '@/src/constants/config/types'
import { BaseError, Hash, TransactionNotFoundError } from 'viem'
import { useTransactionConfirmations } from 'wagmi'
import { useBridgeRequiredBlocks } from '@/src/hooks/bridge/useBridgeRequiredBlocks'

const POLLING_INTERVAL = 5_000

// How long a hash may be missing from the RPC before we treat it as genuinely not found. It only
// governs directly-opened/unknown hashes: it covers ordinary RPC propagation plus a few polling
// cycles. Submitted transactions bypass it entirely — we already hold a valid hash from the wallet.
const PROPAGATION_GRACE_MS = 60_000

type BridgeBlockInfo = { requiredBlocks: number; estimatedTimeInSeconds: number }

export type BridgeProgressData = {
  isMined: boolean
  progress: number
  confirmations: number
  requiredBlocks: number
  estimatedTimeInSeconds: number
}

const isTransactionNotFoundError = (error: Error | null): boolean => {
  if (!error) return false
  if (error instanceof TransactionNotFoundError) return true
  // wagmi/viem wrap the original error; walk the cause chain to find it
  return error instanceof BaseError && !!error.walk((e) => e instanceof TransactionNotFoundError)
}

const buildProgressData = (
  { estimatedTimeInSeconds, requiredBlocks }: BridgeBlockInfo,
  rawConfirmations: bigint,
): BridgeProgressData => {
  // viem returns 0 for an unmined tx and counts the inclusion block as confirmation #1
  const isMined = rawConfirmations > 0n
  // drop viem's +1 so 0 means "just mined"; clamp guards against a lagging node reading below the tx block
  const blocksSinceMined = Math.max(0, Number(rawConfirmations) - 1)
  const progress =
    blocksSinceMined > requiredBlocks ? 100 : Math.round((blocksSinceMined / requiredBlocks) * 100)

  return {
    isMined,
    progress,
    confirmations: blocksSinceMined, // legacy field name kept for consumers
    requiredBlocks,
    estimatedTimeInSeconds,
  }
}

type ProgressState = {
  progressData: BridgeProgressData | undefined
  isWaitingForPropagation: boolean
  isNotFound: boolean
  isError: boolean
}

// Pure lifecycle decision, extracted from the React/query wiring so it can be reasoned about and
// unit-tested in isolation. See ./__tests__ (or the plan's behaviour cases) for the intended matrix.
export const deriveProgressState = ({
  bridgeBlockInfo,
  error,
  isPastGrace,
  isSubmitted,
  rawConfirmations,
}: {
  bridgeBlockInfo: BridgeBlockInfo | undefined
  error: Error | null
  isPastGrace: boolean
  isSubmitted: boolean
  rawConfirmations: bigint | undefined
}): ProgressState => {
  // Still loading the required-block configuration; nothing to show yet.
  if (!bridgeBlockInfo) {
    return {
      progressData: undefined,
      isWaitingForPropagation: false,
      isNotFound: false,
      isError: false,
    }
  }

  // The RPC returned confirmations: render normal mined/confirming progress.
  if (rawConfirmations !== undefined) {
    return {
      progressData: buildProgressData(bridgeBlockInfo, rawConfirmations),
      isWaitingForPropagation: false,
      isNotFound: false,
      isError: false,
    }
  }

  // No confirmations, and the failure is not "transaction not found": a real RPC error. Surface it
  // rather than claiming the transaction does not exist.
  if (error && !isTransactionNotFoundError(error)) {
    return {
      progressData: undefined,
      isWaitingForPropagation: false,
      isNotFound: false,
      isError: true,
    }
  }

  // Transaction-not-found past the grace period, with no proof the hash is valid: genuinely missing.
  // Submitted transactions never reach here — we know their hash is valid.
  if (!isSubmitted && isPastGrace && isTransactionNotFoundError(error)) {
    return {
      progressData: undefined,
      isWaitingForPropagation: false,
      isNotFound: true,
      isError: false,
    }
  }

  // Otherwise the hash is (still) propagating: expose zero-confirmation pending progress so the
  // "Waiting for transaction to be mined" state renders while polling continues.
  const { estimatedTimeInSeconds, requiredBlocks } = bridgeBlockInfo
  return {
    progressData: {
      isMined: false,
      progress: 0,
      confirmations: 0,
      requiredBlocks,
      estimatedTimeInSeconds,
    },
    isWaitingForPropagation: true,
    isNotFound: false,
    isError: false,
  }
}

export const useBridgeProgress = (
  chainId: ChainsValues,
  isNativeBridge: boolean,
  transactionId: string,
  isSubmitted = false,
) => {
  const [shouldPolling, setShouldPolling] = useState(true)

  const { data: bridgeBlockInfo, isLoading: isLoadingBlockInfo } = useBridgeRequiredBlocks(
    chainId,
    isNativeBridge,
  )

  // single co-located read (getBlockNumber + getTransaction in one Promise.all), so the block
  // height and the tx's block come from the same snapshot. Only runs once bridgeBlockInfo is defined.
  const { data: rawConfirmations, error } = useTransactionConfirmations({
    hash: transactionId as Hash,
    chainId,
    query: {
      enabled: !!bridgeBlockInfo,
      refetchInterval: shouldPolling ? POLLING_INTERVAL : false,
      // a not-yet-propagated tx makes getTransaction throw; keep polling instead of retrying
      retry: false,
    },
  })

  // Timestamp of the first poll where the lookup was enabled but the tx was still missing. We
  // compare it against the grace period on each render — the 5s poll drives the re-evaluation — so
  // there is no separate setTimeout to manage or leak. Reset once confirmations arrive, and whenever
  // the hash/chain changes.
  const propagationStartedAt = useRef<number | null>(null)
  const isAwaitingLookup = !!bridgeBlockInfo && rawConfirmations === undefined

  useEffect(() => {
    propagationStartedAt.current = isAwaitingLookup ? Date.now() : null
  }, [isAwaitingLookup, transactionId, chainId])

  const isPastGrace =
    propagationStartedAt.current !== null &&
    Date.now() - propagationStartedAt.current > PROPAGATION_GRACE_MS

  const { isError, isNotFound, isWaitingForPropagation, progressData } = useMemo(
    () =>
      deriveProgressState({ bridgeBlockInfo, error, isPastGrace, isSubmitted, rawConfirmations }),
    [bridgeBlockInfo, error, isPastGrace, isSubmitted, rawConfirmations],
  )

  // stop polling when the progress is 100%
  useEffect(() => {
    if (progressData?.progress === 100) {
      setShouldPolling(false)
    }
  }, [progressData?.progress])

  return {
    // gated on config only: the pending/propagation state renders through progressData, not Loading
    isLoading: isLoadingBlockInfo,
    isWaitingForPropagation,
    isNotFound,
    isError,
    progressData,
  }
}

export default useBridgeProgress
