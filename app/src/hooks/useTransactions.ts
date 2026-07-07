import { useCallback, useEffect, useState } from 'react'

import useSWR from 'swr'
import { isAddress } from 'viem'

import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { BridgeDirection } from '@/src/pagePartials/bridgeExplorer/latestTransactions/Filters'
import { BridgesValues } from '@/src/constants/config/bridges'
import { msToSeconds } from '@/src/utils/date'
import {
  EnvioQueryArgs,
  Transaction,
  TxsInMemoryFilters,
  fetchTransactions,
} from '@/src/utils/transactions'
import { getValidatorByName } from '@/src/utils/validators'
import { isTransactionHash } from '@/src/utils/tools'
import differenceInDays from 'date-fns/differenceInDays'
import { MAX_DAYS_TO_FILTER } from '@/src/constants/misc'
import { getForeignTransactions, setForeignTransaction } from '@/src/utils/localTransactions'
import { TransactionStatus } from '@/src/utils/transactions'
import useWeb3Name from './useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'

export type UpdateInMemoryTx = (transaction?: Transaction) => void

// @todo hardcoded value (need to think about useSWRPage or useSWRInfinite)
const PAGE_SIZE = 500

const modifyTxs = (txs: Transaction[]) => {
  const claimingTxs = getForeignTransactions()
  return txs.map((tx) => {
    if (tx.transactionStatus !== TransactionStatus.Unclaimed) return tx

    return {
      ...tx,
      isClaiming: claimingTxs.some((txId) => txId === tx.id),
    }
  })
}

export const useFetchTransactions = (
  inMemoryFilters: TxsInMemoryFilters,
  query?: EnvioQueryArgs,
) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Transaction[]>(
    query
      ? [
          'useFetchTransactions',
          JSON.stringify(query),
          query,
          JSON.stringify(inMemoryFilters),
          inMemoryFilters,
        ]
      : null,
    async ([, , _query, , _inMemoryFilters]: [
      string,
      string,
      EnvioQueryArgs,
      string,
      TxsInMemoryFilters,
    ]) => fetchTransactions(_query, _inMemoryFilters),
    { suspense: false },
  )

  const updateInMemoryTransaction = (transaction?: Transaction) => {
    if (!transaction) {
      mutate()
    } else {
      setForeignTransaction(transaction.id)
      mutate(
        (txs: Transaction[] | undefined) =>
          txs?.map((tx: Transaction) =>
            tx.id === transaction.id ? { ...transaction, isClaiming: true } : tx,
          ),
        { revalidate: false },
      )
    }
  }

  return {
    transactions: modifyTxs(data || []),
    error,
    refetch: mutate,
    updateInMemoryTransaction,
    isLoading: isLoading,
    isValidating,
  }
}

export const useTransactionsWithFilters = (filters: TransactionFilter) => {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState<EnvioQueryArgs>()
  const [inMemoryFilters, setInMemoryFilters] = useState<TxsInMemoryFilters>({})
  const { isLoading, isValidating, transactions, updateInMemoryTransaction } = useFetchTransactions(
    inMemoryFilters,
    query,
  )

  const isDomainName = isValidDomainName(filters.hash ?? '')
  const { resolvedAddress } = useWeb3Name({
    name: isDomainName && filters.hash ? filters.hash : undefined,
  })

  useEffect(() => {
    // if the date range is bigger than MAX_DAYS_TO_FILTER, abort the query
    if (
      filters?.endTimestamp &&
      filters?.startTimestamp &&
      differenceInDays(filters.endTimestamp, filters.startTimestamp) > MAX_DAYS_TO_FILTER
    ) {
      return
    }

    const andClauses: Array<Record<string, unknown>> = []
    const inMemoryFiltersAux: TxsInMemoryFilters = { validator: undefined, executor: undefined }
    let updated = false

    if (filters.hash) {
      const hash = (resolvedAddress ?? filters.hash).toLowerCase()
      const isTxHash = isTransactionHash(hash)
      if (isTxHash) {
        andClauses.push({ transactionHash: { _eq: hash } })
      } else if (isAddress(hash) || isDomainName) {
        andClauses.push({ _or: [{ initiator: { _eq: hash } }, { receiver: { _eq: hash } }] })
      }
      updated = true
    }
    if (filters.bridge) {
      if (!filters.bridge.includes('All')) {
        const val = filters.bridge.toUpperCase()
        const enumVal = val.includes('XDAI') ? 'XDAI' : 'AMB'
        andClauses.push({ bridgeType: { _eq: enumVal } })
      }
      updated = true
    }
    if (filters.bridgeDirection) {
      if (filters.bridgeDirection === BridgeDirection.gnosis2mainnet) {
        andClauses.push({ initiatorNetwork: { _eq: 100 } })
      } else if (filters.bridgeDirection === BridgeDirection.mainnet2gnosis) {
        andClauses.push({ initiatorNetwork: { _eq: 1 } })
      }
      updated = true
    }
    if (filters.signedBy) {
      if (!filters.signedBy.includes('All')) {
        const bridgeValue = filters.bridge.toUpperCase() as BridgesValues
        const validator = getValidatorByName(filters.signedBy, bridgeValue)
        if (validator) {
          inMemoryFiltersAux['validator'] = validator.address.toLowerCase()
        }
      }
    }
    if (filters.executedBy) {
      if (!filters.executedBy.includes('All')) {
        const bridgeValue = filters.bridge.toUpperCase() as BridgesValues
        const validator = getValidatorByName(filters.executedBy, bridgeValue)
        if (validator) {
          inMemoryFiltersAux['executor'] = validator.address.toLowerCase()
        }
      }
    }
    if (filters.startTimestamp) {
      andClauses.push({ timestamp: { _gte: msToSeconds(filters.startTimestamp.getTime()) } })
      updated = true
    }
    if (filters.endTimestamp) {
      andClauses.push({ timestamp: { _lte: msToSeconds(filters.endTimestamp.getTime()) } })
      updated = true
    }
    if (updated) {
      setPage(1)
      setQuery({
        where: andClauses.length ? { _and: andClauses } : undefined,
        order_by: [{ timestamp: 'desc' }],
        limit: PAGE_SIZE,
        offset: 0,
      })
    }
    setInMemoryFilters(inMemoryFiltersAux)
  }, [
    filters.hash,
    filters.bridge,
    filters.bridgeDirection,
    filters.status,
    filters.signedBy,
    filters.executedBy,
    filters.startTimestamp,
    filters.endTimestamp,
    resolvedAddress,
    isDomainName,
  ])

  /**
   * @todo we should use useSWRPages to handle new pages loading
   */
  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    setQuery((q) => (q ? { ...q, limit: nextPage * PAGE_SIZE } : q))
  }, [page])

  const filteredTransactions =
    !filters.status || filters.status == 'All Status'
      ? transactions
      : transactions.filter((tx) => tx.transactionStatus == filters.status.toUpperCase())

  return {
    page,
    setPage,
    transactions: filteredTransactions,
    loadMore,
    updateInMemoryTransaction,
    isLoading,
    isValidating,
  }
}
