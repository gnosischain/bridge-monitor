import { useState } from 'react'
import styled from 'styled-components'

import { ButtonPrimary } from '../buttons/Button'
import { genericSuspense } from '../helpers/SafeSuspense'
import { ListBottomInformation } from './ListBottomInformation'
import { TransactionHeader } from './TransactionsHeader'
import { TransactionsList } from './TransactionsList'
import { ITEMS_PER_PAGE } from '@/src/constants/misc'
import { useTransactionsWithFilters } from '@/src/hooks/subgraph/useTransactions'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { Loading } from '@/src/components/loading/Loading'

const Table = styled.table<{ empty?: boolean }>`
  line-height: 2.2rem;
  margin-top: ${({ theme: { common } }) => common.space * 2}px;
  min-height: ${(props) => (props.empty ? '20vh' : '0')};
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin-top: ${({ theme: { common } }) => common.space * 10}px;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme: { common } }) => common.space * 6}px;
`

const Spinner = styled(Loading)`
  min-height: 200px;
`

type TransactionsTableProps = {
  bridge: string
  filters: TransactionFilter
}

interface SuspenseTableProps extends TransactionsTableProps {
  page: number
}

const SuspenseTable: React.FC<SuspenseTableProps> = genericSuspense(
  ({ bridge, filters, page }) => {
    const { transactions } = useTransactionsWithFilters(filters)
    const { validators } = useFetchValidators(bridge)

    return (
      <Table empty={transactions.length === 0}>
        {transactions.length > 0 && <TransactionHeader validators={validators} />}
        <TransactionsList page={page} transactions={transactions} />
      </Table>
    )
  },
  () => <Spinner />,
)

const TransactionsTable: React.FC<TransactionsTableProps> = ({ bridge, filters }) => {
  const { loadMore, transactions } = useTransactionsWithFilters(filters)
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)

  return (
    <>
      <SuspenseTable bridge={bridge} filters={filters} page={page} />
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
        endDate={filters.endTimestamp.toLocaleDateString()}
        startDate={filters.startTimestamp.toLocaleDateString()}
        transactionsNumber={transactions.length}
      />
    </>
  )
}

export default TransactionsTable
