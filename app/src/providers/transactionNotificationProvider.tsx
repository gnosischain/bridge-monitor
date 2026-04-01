import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import toast from 'react-hot-toast'

import { ChainsValues } from '@/src/constants/config/types'
import { usePersistedState } from '@/src/hooks/usePersistedState'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

type TransactionStorageItem = {
  chainId: ChainsValues
  address: string
  txHash: string
}

type TransactionContextValue = {
  storeBridgeTx: (txHash: string) => void
  state: TransactionStorageItem[]
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined)

const TRANSACTIONS_STORE = 'pending-transactions'

export const TransactionNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address, appChainId } = useWeb3Connection()
  const publicClient = usePublicClient()
  const [isRan, setIsRan] = useState(false)

  const [transactionStore, setTransactionStore] = usePersistedState<TransactionStorageItem[]>(
    TRANSACTIONS_STORE,
    [],
  )

  const removeTxFromStorage = useCallback(
    (txHash: string) => {
      if (!transactionStore) return
      setTransactionStore(transactionStore.filter((tx) => tx.txHash !== txHash))
    },
    [setTransactionStore, transactionStore],
  )

  const storeBridgeTx = useCallback(
    (txHash: string) => {
      if (!address || !transactionStore) return
      setTransactionStore([...transactionStore, { chainId: appChainId, address, txHash }])
      toast.loading('Bridge transaction pending...', { id: txHash })
    },
    [address, appChainId, setTransactionStore, transactionStore],
  )

  // On mount, recover pending bridge txs from storage and wait for them
  useEffect(() => {
    if (!address || !appChainId || !publicClient || isRan) return
    setIsRan(true)

    const recoverTxStatus = async () => {
      const pendingTxs = (transactionStore ?? []).filter(
        (tx) => address === tx.address && appChainId === tx.chainId && tx.txHash,
      )

      const statuses = await Promise.all(
        pendingTxs.map(async (tx) => {
          const transaction = await publicClient.getTransaction({
            hash: tx.txHash as `0x${string}`,
          })
          return { txHash: tx.txHash, blockNumber: transaction.blockNumber }
        }),
      )

      // Clear already-mined txs silently
      statuses.filter((s) => s.blockNumber !== null).forEach((s) => removeTxFromStorage(s.txHash))

      const pending = statuses.filter((s) => s.blockNumber === null)

      if (pending.length > 0) {
        toast(
          `${pending.length} bridge transaction${pending.length > 1 ? 's' : ''} still pending`,
          {
            icon: '⏳',
          },
        )
      }

      await Promise.allSettled(
        pending.map(async ({ txHash }) => {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash as `0x${string}`,
          })
          if (receipt.status === 'success') {
            toast.success('Bridge transaction confirmed', { id: txHash })
          } else {
            toast.error('Bridge transaction failed', { id: txHash })
          }
          removeTxFromStorage(txHash)
        }),
      )
    }

    recoverTxStatus()
  }, [address, appChainId, isRan, publicClient, removeTxFromStorage, transactionStore])

  const values: TransactionContextValue = {
    state: (transactionStore ?? []) as TransactionStorageItem[],
    storeBridgeTx,
  }

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
