/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react'

import { ContractTransaction } from 'ethers'
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
    (tx: ContractTransaction | Hash) => {
      // viem write path (wagmi hooks): the result is a `0x…` transaction hash
      if (typeof tx === 'string') {
        notifyWaitingForTxMined(tx)
        waitForTransactionReceipt(tx, appChainId)
          .then((r) => notifyTxMined(r.transactionHash, r.status === 'success'))
          .catch((e) => {
            console.error(e)
            notifyTxMined(tx)
          })
        return
      }

      // ethers write path (legacy — PRs 12–14 still route through here)
      notifyWaitingForTxMined(tx.hash)
      tx.wait()
        .then((r) => notifyTxMined(r.transactionHash, true))
        .catch((e) => {
          const error = new TransactionError(
            e.data?.message || e.message || 'Unable to decode revert reason',
            e.data?.code || e.code,
            e.data,
          )

          console.error(error)

          notifyTxMined(tx.hash)
        })
    },
    [appChainId, notifyTxMined, notifyWaitingForTxMined],
  )

  return useCallback(
    async function sendTransaction<T extends ContractTransaction | Hash>(
      methodToCall: () => Promise<T>,
    ): Promise<T | null> {
      if (!skipConnectionCheck && !isAppConnected) {
        console.error('App is not connected')
        return null
      }

      try {
        notifyWaitingForSignature()
        const receipt = await methodToCall()
        if (receipt) waitForTxExecution(receipt)
        return receipt
      } catch (e: any) {
        console.error(e)
        // viem throws a `UserRejectedRequestError` (often wrapped) instead of ethers' 4001 code
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
