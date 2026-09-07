import { useCallback, useEffect, useMemo, useState } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'

import { ALL_STATUS_OPTION } from '@/src/constants/filters'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import useWeb3Name from '@/src/hooks/useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import {
  LocalClaimExecution,
  LocalClaims,
  getForeignTransactions,
  removeForeignTransaction,
  setForeignTransaction,
  setForeignTransactionClaimed,
} from '@/src/utils/localTransactions'
import {
  EnvioQueryArgs,
  Transaction,
  TransactionExecution,
  TransactionStatus,
  TxsInMemoryFilters,
  fetchTransactions,
  getTxScanUrl,
} from '@/src/utils/transactions'
import { buildTransactionsQuery } from '@/src/utils/transactionsQuery'

const INDEXER_POLL_INTERVAL = 5_000

// Shared empty values, so the hook's output keeps a stable identity while the query is idle.
const NO_TRANSACTIONS: Transaction[] = []
const NO_LOCAL_CLAIMS: LocalClaims = { claiming: [], claimed: [] }
const NO_IN_MEMORY_FILTERS: TxsInMemoryFilters = {}

export type ClaimActions = {
  /**
   * Flags a withdrawal as being claimed, so the button stops offering a second claim while the
   * indexer catches up. Local to this browser.
   */
  markAsClaiming: (transaction: Transaction) => void
  /**
   * Records the mined claim transaction. The withdrawal is completed from that moment on, whatever
   * the indexer still reports, so the row flips without waiting for indexing.
   */
  markAsClaimed: (transaction: Transaction, execution: LocalClaimExecution) => void
  /**
   * Drops the local record when the claim never landed, so the row goes back to offering a claim
   * instead of sitting on "Claiming..." until the entry expires.
   */
  clearClaim: (transaction: Transaction) => void
}

const useClaimingTransactions = () => {
  const [localClaims, setLocalClaims] = useState(NO_LOCAL_CLAIMS)

  useEffect(() => {
    setLocalClaims(getForeignTransactions())
  }, [])

  const markAsClaiming = useCallback((transaction: Transaction) => {
    setForeignTransaction(transaction.id)
    setLocalClaims(getForeignTransactions())
  }, [])

  const markAsClaimed = useCallback((transaction: Transaction, execution: LocalClaimExecution) => {
    setForeignTransactionClaimed(transaction.id, execution)
    setLocalClaims(getForeignTransactions())
  }, [])

  const clearClaim = useCallback((transaction: Transaction) => {
    removeForeignTransaction(transaction.id)
    setLocalClaims(getForeignTransactions())
  }, [])

  return { clearClaim, localClaims, markAsClaiming, markAsClaimed }
}

/**
 * Shapes the claim this browser sent like the indexer's execution record, so the last step of the
 * withdrawal renders instead of staying hidden until indexing catches up.
 */
const localExecution = (
  transaction: Transaction,
  execution: LocalClaimExecution,
): TransactionExecution => ({
  id: execution.transactionHash,
  timestamp: execution.timestamp,
  transactionHash: execution.transactionHash,
  validatorAddr: execution.executor,
  scanUrl: getTxScanUrl(execution.transactionHash, transaction.receiverNetwork),
})

/**
 * The indexer is the source of truth for every row, except the withdrawals this browser has just
 * claimed: there the client knows first, so the local record wins until indexing catches up.
 */
const withLocalClaims = (
  transactions: Transaction[] | undefined,
  { claimed, claiming }: LocalClaims,
) => {
  if (!transactions) return NO_TRANSACTIONS
  if (!claiming.length && !claimed.length) return transactions

  return transactions.map((tx) => {
    if (tx.transactionStatus !== TransactionStatus.Unclaimed) return tx

    // The claim is mined, so the withdrawal is completed even though the indexer has yet to say so.
    // Its execution comes from the claim transaction as well: the status alone would flip the row
    // to Completed while leaving the completed step with nothing to show.
    const claim = claimed.find(({ id }) => id === tx.id)
    if (claim)
      return {
        ...tx,
        execution: tx.execution ?? (claim.execution && localExecution(tx, claim.execution)),
        transactionStatus: TransactionStatus.Completed,
      }

    return { ...tx, isClaiming: claiming.includes(tx.id) }
  })
}

export const useFetchTransactions = (
  query?: EnvioQueryArgs,
  inMemoryFilters: TxsInMemoryFilters = NO_IN_MEMORY_FILTERS,
  { pollUntilFound = false }: { pollUntilFound?: boolean } = {},
) => {
  const { clearClaim, localClaims, markAsClaimed, markAsClaiming } = useClaimingTransactions()

  const { data, isLoading } = useQuery({
    queryKey: ['useFetchTransactions', query ?? null, inMemoryFilters],
    queryFn: query ? () => fetchTransactions(query, inMemoryFilters) : skipToken,
    refetchInterval: pollUntilFound
      ? ({ state }) => (state.data?.length ? false : INDEXER_POLL_INTERVAL)
      : false,
  })

  const transactions = useMemo(() => withLocalClaims(data, localClaims), [data, localClaims])

  const claimActions = useMemo<ClaimActions>(
    () => ({ clearClaim, markAsClaiming, markAsClaimed }),
    [clearClaim, markAsClaiming, markAsClaimed],
  )

  return { transactions, claimActions, isLoading }
}

export const useTransactionsWithFilters = (filters: TransactionFilter) => {
  const isDomainName = isValidDomainName(filters.hash)
  const { isResolvingAddress, resolvedAddress } = useWeb3Name({
    name: isDomainName ? filters.hash : undefined,
  })

  const { inMemoryFilters, query } = buildTransactionsQuery(filters, resolvedAddress)

  const { claimActions, isLoading, transactions } = useFetchTransactions(
    // Hold the query back until the domain lookup settles: querying on the raw name matches
    // nothing and would flash "no results" before the resolved-address query lands.
    isResolvingAddress ? undefined : query,
    inMemoryFilters,
  )

  const filteredTransactions = useMemo(
    () =>
      !filters.status || filters.status === ALL_STATUS_OPTION
        ? transactions
        : transactions.filter((tx) => tx.transactionStatus === filters.status.toUpperCase()),
    [transactions, filters.status],
  )

  return {
    transactions: filteredTransactions,
    claimActions,
    isLoading: isLoading || isResolvingAddress,
  }
}
