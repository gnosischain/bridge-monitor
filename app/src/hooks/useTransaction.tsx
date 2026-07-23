/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react'

import { type Hash, isHash } from 'viem'
import toast from 'react-hot-toast'
import { sendCalls, sendTransaction, waitForCallsStatus } from 'wagmi/actions'

import { notify } from '@/src/components/toast'
import { ChainsValues } from '@/src/constants/config/types'
import { ToastStates } from '@/src/constants/types'
import { type TxCall, waitForTransactionReceipt } from '@/src/lib/web3/transactions'
import { wagmiConfig } from '@/src/providers/wagmi'
import { useTransactionNotification } from '@/src/providers/transactionNotificationProvider'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { TransactionError } from '@/src/utils/TransactionError'

export type QueryOptions = {
  refetchInterval: number
}

// A write to dispatch: one or more low-level calls plus the chain they run on. Callers build the
// calls with `toCall` (see `@/src/lib/web3/transactions`). Option A always passes a single call.
export type SendTxParams = { calls: TxCall[]; chainId: ChainsValues }

export default function useTransaction({
  skipConnectionCheck,
}: { skipConnectionCheck?: boolean } = {}) {
  const { canBatch, isAppConnected } = useWeb3Connection()
  const {
    notifyRejectSignature,
    notifyTxMined,
    notifyWaitingForSignature,
    notifyWaitingForTxMined,
  } = useTransactionNotification()

  const waitForTxExecution = useCallback(
    (hash: Hash, chainId: ChainsValues) => {
      notifyWaitingForTxMined(hash)
      waitForTransactionReceipt(hash, chainId)
        .then((r) => notifyTxMined(r.transactionHash, r.status === 'success'))
        .catch((e) => {
          console.error(e)
          notifyTxMined(hash)
        })
    },
    [notifyTxMined, notifyWaitingForTxMined],
  )

  return useCallback(
    async function send({ calls, chainId }: SendTxParams): Promise<Hash | null> {
      if (!skipConnectionCheck && !isAppConnected) {
        console.error('App is not connected')
        return null
      }
      if (calls.length === 0) {
        console.error('No calls to send')
        return null
      }

      try {
        notifyWaitingForSignature()

        let hash: Hash | undefined
        if (canBatch) {
          // Smart account (EIP-5792): `wallet_sendCalls` returns an opaque bundle id, not a tx
          // hash. Poll `wallet_getCallsStatus` for the executed bundle and read the real on-chain
          // hash off its receipt, so downstream (explorer route, receipt waits) gets a valid hash.
          const { id } = await sendCalls(wagmiConfig, { calls, chainId })
          const { receipts, status } = await waitForCallsStatus(wagmiConfig, { id })
          if (status !== 'success') {
            throw new Error('Transaction batch failed')
          }
          hash = receipts?.at(-1)?.transactionHash
        } else {
          // EOA: a single plain transaction resolves to a 32-byte on-chain hash synchronously.
          const [call] = calls
          hash = await sendTransaction(wagmiConfig, {
            to: call.to,
            data: call.data,
            value: call.value,
            chainId,
          })
        }

        // Safety net: never let a missing/non-hash value reach the explorer route /
        // eth_getTransactionByHash.
        if (!hash || !isHash(hash)) {
          notifyRejectSignature(
            'This wallet did not return a transaction hash — track the transaction from your wallet instead.',
          )
          return null
        }

        waitForTxExecution(hash, chainId)
        return hash
      } catch (e: any) {
        console.error(e)

        // Multisig / non-instant Safe: the bundle was accepted but did not execute within the wait
        // window, so there is no on-chain hash yet. Not a failure — inform the user and bail.
        if (e?.name === 'WaitForCallsStatusTimeoutError') {
          toast.remove('waitingForSignature')
          notify({
            type: ToastStates.waiting,
            message:
              'Transaction submitted to your wallet. It will execute once confirmed — reload to see its status.',
          })
          return null
        }

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
      canBatch,
      notifyWaitingForSignature,
      waitForTxExecution,
      notifyRejectSignature,
    ],
  )
}
