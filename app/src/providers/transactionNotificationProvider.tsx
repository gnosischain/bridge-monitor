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
  notifyTxMined: (txHash: string, chainId: ChainsValues, isSuccess?: boolean) => void
  notifyWaitingForSignature: () => void
  notifyWaitingForTxMined: (txHash: string, chainId: ChainsValues) => void
  notifyRejectSignature: (msg: string) => void
  state: TransactionStorageItem[]
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined)

const TRANSACTIONS_STORE = 'pending-transactions'

export const TransactionNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address, getExplorerUrl } = useWeb3Connection()
  const [isRan, setIsRan] = useState(false)

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
    (txHash: string, chainId: ChainsValues) => {
      toast.remove('waitingForSignature')
      if (!transactionStore || !address) return
      setTransactionStore([...transactionStore, { chainId, address, txHash }])

      notify({
        type: ToastStates.waiting,
        explorerUrl: getExplorerUrl(txHash, getChainKey(chainId)),
        id: txHash,
      })
    },
    [transactionStore, address, setTransactionStore, getExplorerUrl],
  )

  const notifyTxMined = useCallback(
    (txHash: string, chainId: ChainsValues, isSuccess?: boolean) => {
      if (isSuccess) {
        notify({
          type: ToastStates.success,
          explorerUrl: getExplorerUrl(txHash, getChainKey(chainId)),
          id: txHash,
        })

        removeTxFromStorage(txHash)
      } else {
        notify({
          type: ToastStates.failed,
          explorerUrl: getExplorerUrl(txHash, getChainKey(chainId)),
          id: txHash,
        })

        removeTxFromStorage(txHash)
      }
    },
    [getExplorerUrl, removeTxFromStorage],
  )

  // Check if there are previous tx on the storage
  useEffect(() => {
    if (!address || isRan) return
    setIsRan(true)
    const recoverTxStatus = async () => {
      // recover txHashes from storage
      const storedTxs = (transactionStore || []).filter((tx) => address === tx.address && tx.txHash)

      // check txHashes status: an already-mined tx has a receipt, drop it from storage;
      // a not-yet-mined tx has none (getTransactionReceipt throws) and stays pending
      const checkedTxs = await Promise.all(
        storedTxs.map(async (tx) => {
          try {
            await getTransactionReceipt(tx.txHash as Hash, tx.chainId)
            removeTxFromStorage(tx.txHash)
            return null
          } catch {
            return tx
          }
        }),
      )

      // get not mined txs
      const pendingTxs = checkedTxs.filter((tx) => tx !== null)
      if (pendingTxs.length > 0) {
        notify({
          type: ToastStates.waiting,
          message: `There are ${pendingTxs.length} pending transactions`,
        })
      }

      // wait for txs to be executed
      const promises = pendingTxs.map(async ({ chainId, txHash }) => {
        const receipt = await waitForTransactionReceipt(txHash as Hash, chainId)
        notifyTxMined(txHash, chainId, receipt.status === 'success')
      })

      await Promise.allSettled(promises)
    }

    recoverTxStatus()
  }, [address, isRan, notifyTxMined, removeTxFromStorage, transactionStore])

  const values: TransactionContextValue = useMemo(
    () => ({
      state: transactionStore as TransactionStorageItem[],
      notifyTxMined,
      notifyWaitingForSignature,
      notifyWaitingForTxMined,
      notifyRejectSignature,
    }),
    [
      transactionStore,
      notifyTxMined,
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
