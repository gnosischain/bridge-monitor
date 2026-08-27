import { recoverLocalStorageKey, setLocalStorageKey } from '@/src/hooks/usePersistedState'
import addMilliseconds from 'date-fns/addMilliseconds'
import compareAsc from 'date-fns/compareAsc'
import parseISO from 'date-fns/parseISO'

const OLD_ENOUGH = 30 * 60 * 60 * 1000
const key = 'claimTxs'
const setState = setLocalStorageKey.bind(null, key)

/**
 * What this browser knows about the claim it sent, so the withdrawal can be shown as executed
 * before the indexer reports it. `timestamp` is in milliseconds, like the indexer's execution
 * record once mapped.
 */
export type LocalClaimExecution = { transactionHash: string; timestamp: number; executor?: string }

type ClaimRecord = {
  id: string
  timestamp: Date
  isClaimed?: boolean
  execution?: LocalClaimExecution
}

/** Entries stored before the claim transaction was recorded carry no `execution`. */
export type LocalClaim = { id: string; execution?: LocalClaimExecution }

export type LocalClaims = { claiming: string[]; claimed: LocalClaim[] }

const state = () => recoverLocalStorageKey<ClaimRecord[]>(key, [])

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

export const setForeignTransactionClaimed = (
  transactionId: string,
  execution: LocalClaimExecution,
) => {
  // promote the entry: the claim is mined, so the withdrawal is completed
  setState(
    state().map((tx) => (tx.id === transactionId ? { ...tx, isClaimed: true, execution } : tx)),
  )
}

export const removeForeignTransaction = (transactionId: string) => {
  // update localStorage
  setState(state().filter((tx) => tx.id !== transactionId))
}

export const getForeignTransactions = (): LocalClaims => {
  // recover all transactions from localStorage
  const localState = state()

  if (!localState) {
    return { claiming: [], claimed: [] }
  }

  // discard transactions that are too old (OLD_ENOUGH)
  const transactions = localState.filter((txInfo) => !isTooOld(txInfo.timestamp))

  // update localStorage with the filtered transactions
  setState(transactions)

  return {
    claiming: transactions.filter((txInfo) => !txInfo.isClaimed).map((txInfo) => txInfo.id),
    claimed: transactions
      .filter((txInfo) => txInfo.isClaimed)
      .map(({ execution, id }) => ({ id, execution })),
  }
}
