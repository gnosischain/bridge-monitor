/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react'

import { type Hash } from 'viem'

import { waitForTransactionReceipt } from '@/src/lib/web3/transactions'
import { useTransactionNotification } from '@/src/providers/transactionNotificationProvider'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { TransactionError } from '@/src/utils/TransactionError'

export type QueryOptions = {
  refetchInterval: number
}

export default function useTransaction({
  skipConnectionCheck,
}: { skipConnectionCheck?: boolean } = {}) {
  const { appChainId, isAppConnected } = useWeb3Connection()
  const {
    notifyRejectSignature,
    notifyTxMined,
    notifyWaitingForSignature,
    notifyWaitingForTxMined,
  } = useTransactionNotification()

  const waitForTxExecution = useCallback(
    (hash: Hash) => {
      notifyWaitingForTxMined(hash)
      waitForTransactionReceipt(hash, appChainId)
        .then((r) => notifyTxMined(r.transactionHash, r.status === 'success'))
        .catch((e) => {
          console.error(e)
          notifyTxMined(hash)
        })
    },
    [appChainId, notifyTxMined, notifyWaitingForTxMined],
  )

  return useCallback(
    async function sendTransaction(methodToCall: () => Promise<Hash>): Promise<Hash | null> {
      if (!skipConnectionCheck && !isAppConnected) {
        console.error('App is not connected')
        return null
      }

      try {
        notifyWaitingForSignature()
        const hash = await methodToCall()
        if (hash) waitForTxExecution(hash)
        return hash
      } catch (e: any) {
        console.error(e)
        // wallet rejections arrive in a few shapes: the EIP-1193 `4001` code, or a
        // `UserRejectedRequestError` (sometimes nested under `.cause`)
        const isUserRejection =
          e.code === 4001 ||
          e.name === 'UserRejectedRequestError' ||
          e.cause?.name === 'UserRejectedRequestError'
        const error = new TransactionError(
          e.data?.message || e.shortMessage || e.message || 'Unable to decode revert reason',
          e.data?.code || e.code,
          e.data,
        )

        notifyRejectSignature(isUserRejection ? 'User denied signature' : error.message)

        return null
      }
    },
    [
      skipConnectionCheck,
      isAppConnected,
      notifyWaitingForSignature,
      waitForTxExecution,
      notifyRejectSignature,
    ],
  )
}
