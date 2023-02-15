import { useCallback, useEffect, useState } from 'react'

import { isAddress } from '@ethersproject/address'
import useSWR from 'swr'

import { TransactionFilter } from '../useTransactionsFilters'
import { BridgeDirection } from '@/src/components/transactions/TransactionsFilter'
import { BridgesValues } from '@/src/constants/config/bridges'
import { POLLING_INTERVAL } from '@/src/constants/misc'
import { milliToSeconds, toSeconds } from '@/src/utils/date'
import { fetchTransactions } from '@/src/utils/transactions'
import { getValidatorByName } from '@/src/utils/validators'
import {
  OrderDirection,
  TransactionStatus,
  Transaction_Filter,
  Transaction_OrderBy,
  TransactionsQueryVariables,
} from '@/types/generated/subgraph'

// @todo hardcoded value (need to think about useSWRPage or useSWRInfinite)
const PAGE_SIZE = 500

export const useFetchTransactions = (query?: TransactionsQueryVariables) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(
    query ? ['useFetchTransactions', JSON.stringify(query)] : null,
    () => {
      if (!query) return []
      return fetchTransactions(query)
    },
    { refreshInterval: POLLING_INTERVAL },
  )

  return { transactions: data ?? [], error, refetch }
}

export const useTransactionsWithFilters = (filters: TransactionFilter) => {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState<TransactionsQueryVariables>()
  const { transactions } = useFetchTransactions(query)

  useEffect(() => {
    const _where: Transaction_Filter = {
      // @todo there are some bridges without name
      bridgeName_not: null,
    }
    let updated = false
    if (filters.hash) {
      // is hash ()
      const isHash = filters.hash.length > 42
      const text = filters.hash.toLowerCase()
      if (isHash) {
        _where['transactionHash'] = text
      } else {
        if (isAddress(text)) {
          _where['initiator'] = text
        } else {
          _where['initiator'] = '0x00' // @todo awful way to fetch no results by using an invalid address, a better approach would be adding a valid/invalid status in query object
        }
      }
      updated = true
    }
    if (filters.bridge) {
      if (!filters.bridge.includes('All')) {
        _where['bridgeName_contains_nocase'] = filters.bridge.toUpperCase()
      }
      updated = true
    }
    if (filters.bridgeDirection) {
      if (!filters.bridgeDirection.includes('All')) {
        updated = true
      }
      if (BridgeDirection.gnosis2mainnet === filters.bridgeDirection) {
        _where['initiatorNetwork'] = 'gnosis'
      }
      if (BridgeDirection.mainnet2gnosis === filters.bridgeDirection) {
        _where['initiatorNetwork'] = 'mainnet'
      }
      updated = true
    }
    if (filters.status) {
      if (filters.status.includes('All')) {
        updated = true
      }
      // @todo not added into the selector options yet
      if (TransactionStatus.Initiated === filters.status.toUpperCase()) {
        _where['transactionStatus'] = TransactionStatus.Initiated
        updated = true
      }
      if (TransactionStatus.Requested === filters.status.toUpperCase()) {
        _where['transactionStatus'] = TransactionStatus.Requested
        updated = true
      }
      if (TransactionStatus.Collecting === filters.status.toUpperCase()) {
        _where['transactionStatus'] = TransactionStatus.Collecting
        updated = true
      }
      if (TransactionStatus.Claimed === filters.status.toUpperCase()) {
        _where['transactionStatus'] = TransactionStatus.Claimed
        updated = true
      }
      if (TransactionStatus.Unclaimed === filters.status.toUpperCase()) {
        _where['transactionStatus'] = TransactionStatus.Unclaimed
        updated = true
      }
      if (TransactionStatus.Completed === filters.status.toUpperCase()) {
        _where['transactionStatus'] = TransactionStatus.Completed
        updated = true
      }
    }
    if (filters.signedBy) {
      if (filters.signedBy.includes('All')) {
        updated = true
      }
      // @todo we might need to convert the validator name -> address in a diff place
      // @todo as we can not differentiate the network we will check in both validators objects
      const bridgeValue = filters.bridge.toUpperCase() as BridgesValues
      const validator = getValidatorByName(filters.signedBy, bridgeValue)
      if (validator) {
        _where['validations_'] = {
          validatorAddress: validator.address.toLowerCase(),
        }
        updated = true
      }
    }
    if (filters.executedBy) {
      if (filters.executedBy.includes('All')) {
        updated = true
      }
      const bridgeValue = filters.bridge.toUpperCase() as BridgesValues
      const validator = getValidatorByName(filters.executedBy, bridgeValue)
      if (validator) {
        _where['execution_'] = {
          executorAddress: validator.address.toLowerCase(),
        }
        updated = true
      }
    }
    if (filters.startTimestamp) {
      _where['timestamp_gte'] = milliToSeconds(toSeconds(filters.startTimestamp))
      updated = true
    }
    if (filters.endTimestamp) {
      _where['timestamp_lte'] = milliToSeconds(toSeconds(filters.endTimestamp))
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

  return {
    page,
    setPage,
    transactions,
    loadMore,
  }
}
