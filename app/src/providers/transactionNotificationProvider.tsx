import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { type Hash } from 'viem'
import toast from 'react-hot-toast'

import { notify } from '@/src/components/toast'
import { ChainsValues } from '@/src/constants/config/types'
import { ToastStates } from '@/src/constants/types'
import { usePersistedState } from '@/src/hooks/usePersistedState'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getChainKey } from '@/src/constants/config/chains'
import { getTransactionReceipt, waitForTransactionReceipt } from '@/src/lib/web3/transactions'

type TransactionStorageItem = {
  chainId: ChainsValues
  address: string
  txHash: string
}

type TransactionContextValue = {
  notifyTxMined: (txHash: string, isSuccess?: boolean) => void
  notifyTxUnconfirmed: (txHash: string) => void
  notifyWaitingForSignature: () => void
  notifyWaitingForTxMined: (txHash: string) => void
  notifyRejectSignature: (msg: string) => void
  state: TransactionStorageItem[]
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined)

const TRANSACTIONS_STORE = 'pending-transactions'

export const TransactionNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address, appChainId, getExplorerUrl } = useWeb3Connection()
  const [isRan, setIsRan] = useState(false)

  const chainKey = getChainKey(appChainId)

  const initialState: TransactionStorageItem[] = []

  const [transactionStore, setTransactionStore] = usePersistedState(
    TRANSACTIONS_STORE,
    initialState,
  )

  const removeTxFromStorage = useCallback(
    (txHash: string) => {
      if (!transactionStore) return
      setTransactionStore(
        transactionStore.filter((tx: TransactionStorageItem) => tx.txHash !== txHash),
      )
    },
    [setTransactionStore, transactionStore],
  )

  const notifyWaitingForSignature = useCallback(() => {
    notify({
      type: ToastStates.waiting,
      message: 'Waiting for signature',
      id: 'waitingForSignature',
    })
  }, [])

  const notifyRejectSignature = useCallback((msg: string) => {
    toast.remove('waitingForSignature')
    notify({ type: ToastStates.failed, message: msg })
  }, [])

  const notifyWaitingForTxMined = useCallback(
    (txHash: string) => {
      toast.remove('waitingForSignature')
      if (!transactionStore || !address) return
      setTransactionStore([...transactionStore, { chainId: appChainId, address, txHash }])

      notify({
        type: ToastStates.waiting,
        explorerUrl: getExplorerUrl(txHash, chainKey),
        id: txHash,
      })
    },
    [transactionStore, address, setTransactionStore, appChainId, getExplorerUrl, chainKey],
  )

  const notifyTxMined = useCallback(
    (txHash: string, isSuccess?: boolean) => {
      if (isSuccess) {
        notify({
          type: ToastStates.success,
          explorerUrl: getExplorerUrl(txHash, chainKey),
          id: txHash,
        })

        removeTxFromStorage(txHash)
      } else {
        notify({
          type: ToastStates.failed,
          explorerUrl: getExplorerUrl(txHash, chainKey),
          id: txHash,
        })

        removeTxFromStorage(txHash)
      }
    },
    [chainKey, getExplorerUrl, removeTxFromStorage],
  )

  /**
   * The receipt wait ended without an answer — an RPC error or the 180s timeout, never a revert
   * (the wait resolves with `status: 'reverted'`). Deliberately not `notifyTxMined`: the
   * transaction is most likely mined, so reporting failure would be wrong, and dropping it from
   * storage would stop the recovery effect below from ever settling it. It stays pending.
   */
  const notifyTxUnconfirmed = useCallback(
    (txHash: string) => {
      notify({
        type: ToastStates.waiting,
        title: 'Still confirming',
        message: 'Could not read the receipt — the transaction is still being tracked.',
        explorerUrl: getExplorerUrl(txHash, chainKey),
        id: txHash,
      })
    },
    [chainKey, getExplorerUrl],
  )

  // Check if there are previous tx on the storage
  useEffect(() => {
    if (!address || !appChainId || isRan) return
    setIsRan(true)
    const recoverTxStatus = async () => {
      // recover txHashes from storage
      const storedTxs = (transactionStore || []).filter(
        (tx) => address === tx.address && appChainId === tx.chainId && tx.txHash,
      )

      // check txHashes status: an already-mined tx has a receipt, drop it from storage;
      // a not-yet-mined tx has none (getTransactionReceipt throws) and stays pending
      const hashes = await Promise.all(
        storedTxs.map(async (tx) => {
          try {
            await getTransactionReceipt(tx.txHash as Hash, tx.chainId)
            removeTxFromStorage(tx.txHash)
            return null
          } catch {
            return tx.txHash
          }
        }),
      )

      // get not mined txHashes
      const pendingHashes = hashes.filter((txHash) => txHash !== null)
      if (pendingHashes.length > 0) {
        notify({
          type: ToastStates.waiting,
          message: `There are ${pendingHashes.length} pending transactions`,
        })
      }

      // wait for txs to be executed
      const promises = pendingHashes.map(async (txHash) => {
        const receipt = await waitForTransactionReceipt(txHash as Hash, appChainId)
        notifyTxMined(txHash as string, receipt.status === 'success')
      })

      await Promise.allSettled(promises)
    }

    recoverTxStatus()
  }, [address, appChainId, isRan, notifyTxMined, removeTxFromStorage, transactionStore])

  const values: TransactionContextValue = useMemo(
    () => ({
      state: transactionStore as TransactionStorageItem[],
      notifyTxMined,
      notifyTxUnconfirmed,
      notifyWaitingForSignature,
      notifyWaitingForTxMined,
      notifyRejectSignature,
    }),
    [
      transactionStore,
      notifyTxMined,
      notifyTxUnconfirmed,
      notifyWaitingForSignature,
      notifyWaitingForTxMined,
      notifyRejectSignature,
    ],
  )

  return <TransactionContext.Provider value={values}>{children}</TransactionContext.Provider>
}

export function useTransactionNotification() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error(
      'useTransactionNotification must be used within a TransactionNotificationProvider',
    )
  }
  return context
}
