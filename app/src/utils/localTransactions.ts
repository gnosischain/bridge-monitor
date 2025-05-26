import { recoverLocalStorageKey, setLocalStorageKey } from '@/src/hooks/usePersistedState'
import addMilliseconds from 'date-fns/addMilliseconds'
import compareAsc from 'date-fns/compareAsc'
import parseISO from 'date-fns/parseISO'

const OLD_ENOUGH = 30 * 60 * 60 * 1000
const key = 'claimTxs'
const setState = setLocalStorageKey.bind(null, key)
const state = () => recoverLocalStorageKey<{ id: string; timestamp: Date }[]>(key, [])

const isTooOld = (timestamp: Date | string) => {
  const now = new Date()
  const parsedTimestamp = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp
  const limitDate = addMilliseconds(parsedTimestamp, OLD_ENOUGH)
  return compareAsc(now, limitDate) == 1
}

export const setForeignTransaction = (transactionId: string) => {
  // persist transaction in localStorage
  setState([...state(), { id: transactionId, timestamp: new Date() }])
}

export const removeForeignTransaction = (transactionId: string) => {
  // update localStorage
  setState(state().filter((tx) => tx.id !== transactionId))
}

export const getForeignTransactions = () => {
  // recover all transactions from localStorage
  const localState = state()

  if (!localState) {
    return []
  }

  // discard transactions that are too old (OLD_ENOUGH)
  const transactions = localState.filter((txInfo) => !isTooOld(txInfo.timestamp))

  // update localStorage with the filtered transactions
  setState(transactions)

  return transactions.map((txInfo) => txInfo.id)
}
