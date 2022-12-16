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

const Table = styled.table<{ empty?: boolean }>`
  margin-top: ${({ theme: { common } }) => common.space * 2}px;
  width: 100%;
  min-height: ${(props) => (props.empty ? 'auto' : '40vh')};
  line-height: 22px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin-top: ${({ theme: { common } }) => common.space * 10}px;
  }
  th {
    padding: 0;
    text-align: left;
    font-size: 1.4rem;
    font-weight: 300;
    vertical-align: top;
    &:not(:last-child) {
      padding: ${({ theme: { common } }) => common.space * 2}px
        ${({ theme: { common } }) => common.space * 3}px
        ${({ theme: { common } }) => common.space * 5}px 0;
    }
    &:last-child {
      text-align: right;
    }
    &.validatorsHeader {
      display: flex;
      justify-content: center;
      padding-right: 0;
      background-color: ${({ theme }) => theme.colors.darkerGrey};
      border-top-left-radius: ${({ theme: { common } }) => common.borderRadius};
      border-top-right-radius: ${({ theme: { common } }) => common.borderRadius};
      span {
        display: inline-block;
        font-size: 1.2rem;
        line-height: 22px;
        width: 24px;
        text-align: center;
      }
    }
    @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
      display: none;
    }
  }
  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    thead {
      display: none;
    }
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
  const { loadMore, transactions } = useTransactionsWithFilters(filters)
  const { validators } = useFetchValidators(bridge)
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)

  return (
    <>
      {/* @todo applying filters re-render entire table instead of only transaction list */}
      <Table empty={transactions.length === 0}>
        {transactions.length > 0 && <TransactionHeader validators={validators} />}
        <TransactionsList page={page} transactions={transactions} />
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
        endDate={filters.endTimestamp.toLocaleDateString()}
        startDate={filters.startTimestamp.toLocaleDateString()}
        transactionsNumber={transactions.length}
      />
    </>
  )
}

export default genericSuspense(TransactionsTable)
