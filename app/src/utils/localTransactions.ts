import { recoverLocalStorageKey, setLocalStorageKey } from '@/src/hooks/usePersistedState'
import { Transaction as TransactionSG } from '@/types/generated/subgraph'

const OLD_ENOUGH = 30 * 60 * 1000
const key = 'foreignTransactions'
const setState = setLocalStorageKey.bind(null, key)
const state = () => recoverLocalStorageKey<Record<string, TransactionSG>>(key, {})

const isTooOld = (transaction: TransactionSG) => {
  const timestamp = transaction.execution?.timestamp ?? 0
  return +timestamp * 1000 + OLD_ENOUGH < Date.now()
}

export const setForeignTransaction = (transaction: TransactionSG) => {
  // persist transaction in localStorage
  setState({ ...state(), [transaction.id]: transaction })
}

export const removeForeignTransaction = (transactionId: string) => {
  // remove transaction from localStorage
  const localState = state()

  // if transaction is not in localStorage, do nothing
  if (!localState?.[transactionId]) {
    return
  }

  // update localStorage
  setState(Object.fromEntries(Object.entries(localState).filter(([id]) => id !== transactionId)))
}

export const getForeignTransaction = (transactionId: string) => {
  // recover transaction from localStorage
  const localState = state()

  // if transaction is not in localStorage, return null
  if (!localState?.[transactionId]) {
    return null
  }

  const transaction = localState[transactionId]

  // if transaction is too old, remove it from localStorage and return null
  if (isTooOld(transaction)) {
    removeForeignTransaction(transactionId)
    return null
  }

  return transaction
}

export const getForeignTransactions = () => {
  // recover all transactions from localStorage
  const localState = state()

  if (!localState) {
    return null
  }

  // discard transactions that are too old (OLD_ENOUGH)
  const transactions = Object.fromEntries(
    Object.entries(localState).filter(([, transaction]) => !isTooOld(transaction)),
  )

  // update localStorage with the filtered transactions
  setState(transactions)

  return transactions
}
