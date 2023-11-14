import { useState } from 'react'
import styled from 'styled-components'

import { ButtonPrimary } from '@/src/components/buttons/Button'
import { ListBottomInformation } from '@/src/components/transactions/ListBottomInformation'
import { TransactionHeader } from '@/src/components/transactions/TransactionsHeader'
import { TransactionsList } from '@/src/components/transactions/TransactionsList'
import { ITEMS_PER_PAGE } from '@/src/constants/misc'
import { useTransactionsWithFilters } from '@/src/hooks/subgraph/useTransactions'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { Loading } from '@/src/components/loading/Loading'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'

const Table = styled.table<{ empty?: boolean }>`
  line-height: 2.2rem;
  margin-top: ${({ theme: { common } }) => common.space * 2}px;
  min-height: ${({ empty }) => (empty ? '20vh' : '0')};
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin-top: ${({ theme: { common } }) => common.space * 3}px;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme: { common } }) => common.space * 6}px;
`

type TransactionsTableProps = {
  bridge: string
  filters: TransactionFilter
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ bridge, filters }) => {
  const { isLoading, loadMore, transactions, updateInMemoryTransaction } =
    useTransactionsWithFilters(filters)
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const { validators } = useValidators(bridge as BridgesValues)

  if (isLoading) return <Loading />

  return (
    <>
      <Table empty={transactions.length === 0}>
        {transactions.length > 0 && <TransactionHeader validators={validators} />}
        <TransactionsList
          page={page}
          transactions={transactions}
          updateInMemoryTransaction={updateInMemoryTransaction}
        />
      </Table>
      {page < totalPages && transactions.length > ITEMS_PER_PAGE && (
        <Actions>
          <ButtonPrimary
            onClick={() => {
              setPage((page) => page + 1)
              if (page >= totalPages - 1) {
                loadMore()
              }
            }}
          >
            Load more
          </ButtonPrimary>
        </Actions>
      )}
      <ListBottomInformation
        endDate={filters.endTimestamp?.toLocaleDateString() || 'undefined'}
        startDate={filters.startTimestamp.toLocaleDateString()}
        transactionsNumber={transactions.length}
      />
    </>
  )
}

export default TransactionsTable
