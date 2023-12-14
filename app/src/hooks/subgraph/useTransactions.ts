import { useCallback, useEffect, useState } from 'react'

import { isAddress } from '@ethersproject/address'
import useSWR from 'swr'

import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { BridgeDirection } from '@/src/pagePartials/latestTransactions/TransactionsFilter'
import { BridgesValues } from '@/src/constants/config/bridges'
import { msToSeconds } from '@/src/utils/date'
import { Transaction, TxsInMemoryFilters, fetchTransactions } from '@/src/utils/transactions'
import { getValidatorByName } from '@/src/utils/validators'
import {
  OrderDirection,
  QueryTransactionsArgs,
  TransactionStatus,
  Transaction_Filter,
  Transaction_OrderBy,
} from '@/types/generated/subgraph'
import { isTransactionHash } from '@/src/utils/tools'
import differenceInDays from 'date-fns/differenceInDays'
import { MAX_DAYS_TO_FILTER } from '@/src/constants/misc'
import { getForeignTransactions, setForeignTransaction } from '@/src/utils/localTransactions'

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
  query?: QueryTransactionsArgs,
) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    query
      ? [
          'useFetchTransactions',
          JSON.stringify(query),
          query,
          JSON.stringify(inMemoryFilters),
          inMemoryFilters,
        ]
      : null,
    async ([, , _query, , _inMemoryFilters]) => fetchTransactions(_query, _inMemoryFilters),
    { suspense: false },
  )

  const updateInMemoryTransaction = (transaction?: Transaction) => {
    if (!transaction) {
      mutate()
    } else {
      setForeignTransaction(transaction.id)
      // update in-memory txs
      mutate(
        (txs) =>
          txs?.map((tx) => (tx.id === transaction.id ? { ...transaction, isClaiming: true } : tx)),
        {
          revalidate: false,
        },
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
  const [query, setQuery] = useState<QueryTransactionsArgs>()
  const [inMemoryFilters, setInMemoryFilters] = useState<TxsInMemoryFilters>({})
  const { isLoading, isValidating, transactions, updateInMemoryTransaction } = useFetchTransactions(
    inMemoryFilters,
    query,
  )

  useEffect(() => {
    const _where: Transaction_Filter = {
      and: [],
    }

    const inMemoryFiltersAux: TxsInMemoryFilters = { validator: undefined, executor: undefined }

    let updated = false

    // if the date rage is bigger than MAX_DAYS_TO_FILTER, abort the query
    if (
      filters?.endTimestamp &&
      filters?.startTimestamp &&
      differenceInDays(filters.endTimestamp, filters.startTimestamp) > MAX_DAYS_TO_FILTER
    ) {
      return
    }

    if (filters.hash) {
      const isTxHash = isTransactionHash(filters.hash)
      const text = filters.hash.toLowerCase()
      if (isTxHash) {
        _where.and?.push({ transactionHash: text })
      } else if (isAddress(text)) {
        _where.and?.push({ or: [{ initiator: text }, { receiver: text }] })
      }
      updated = true
    }
    if (filters.bridge) {
      if (!filters.bridge.includes('All')) {
        _where.and?.push({ bridgeName_contains_nocase: filters.bridge.toUpperCase() })
      }
      updated = true
    }
    if (filters.bridgeDirection) {
      if (!filters.bridgeDirection.includes('All')) {
        updated = true
      }
      if (BridgeDirection.gnosis2mainnet === filters.bridgeDirection) {
        _where.and?.push({ initiatorNetwork: 'gnosis' })
      }
      if (BridgeDirection.mainnet2gnosis === filters.bridgeDirection) {
        _where.and?.push({ initiatorNetwork: 'mainnet' })
      }
      updated = true
    }
    if (filters.signedBy) {
      if (filters.signedBy.includes('All')) {
        inMemoryFiltersAux['validator'] = undefined
      } else {
        const bridgeValue = filters.bridge.toUpperCase() as BridgesValues
        const validator = getValidatorByName(filters.signedBy, bridgeValue)
        if (validator) {
          inMemoryFiltersAux['validator'] = validator.address.toLowerCase()
        }
      }
    }
    if (filters.executedBy) {
      if (filters.executedBy.includes('All')) {
        inMemoryFiltersAux['executor'] = undefined
      } else {
        const bridgeValue = filters.bridge.toUpperCase() as BridgesValues
        const validator = getValidatorByName(filters.executedBy, bridgeValue)
        if (validator) {
          inMemoryFiltersAux['executor'] = validator.address.toLowerCase()
        }
      }
    }
    if (filters.startTimestamp) {
      _where.and?.push({ timestamp_gte: msToSeconds(filters.startTimestamp.getTime()) })
      updated = true
    }
    if (filters.endTimestamp) {
      _where.and?.push({ timestamp_lte: msToSeconds(filters.endTimestamp.getTime()) })
      updated = true
    }
    if (updated) {
      setPage(1)
      setQuery((q) => ({
        ...q,
        orderBy: Transaction_OrderBy.Timestamp,
        orderDirection: OrderDirection.Desc,
        first: PAGE_SIZE,
        skip: 0,
        where: _where,
      }))
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
  ])

  /**
   * @todo we should use useSWRPages to handle new pages loading
   */
  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    setQuery((q) => ({
      ...q,
      orderBy: Transaction_OrderBy.Timestamp,
      orderDirection: OrderDirection.Desc,
      skip: 0,
      first: nextPage * PAGE_SIZE,
    }))
  }, [setQuery, setPage, page])

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
