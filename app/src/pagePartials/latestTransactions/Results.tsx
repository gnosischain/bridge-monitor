import styled from 'styled-components'
import { Info } from '@/src/pagePartials/latestTransactions/Info'
import { TransactionsList } from '@/src/pagePartials/transactionsList'
import { useTransactionsWithFilters } from '@/src/hooks/subgraph/useTransactions'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { Loading as BaseLoading } from '@/src/components/loading/Loading'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'
import { Legend } from '@/src/pagePartials/latestTransactions/Legend'

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
  padding: ${({ theme: { common } }) => common.space * 2}px 0
    ${({ theme: { common } }) => common.space * 7}px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`

const Loading = styled(BaseLoading)`
  min-height: 400px;
`

type TransactionsTableProps = {
  bridge: string
  filters: TransactionFilter
}

export const Results: React.FC<TransactionsTableProps> = ({ bridge, filters }) => {
  const { isLoading, transactions, updateInMemoryTransaction } = useTransactionsWithFilters(filters)
  const { validators } = useValidators(bridge as BridgesValues)

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <InfoWrapper>
        <Info
          date={filters.endTimestamp?.toLocaleDateString()}
          transactionsNumber={transactions.length}
        />
        <Legend />
      </InfoWrapper>
      <TransactionsList
        transactions={transactions}
        updateInMemoryTransaction={updateInMemoryTransaction}
        validators={validators}
      />
    </>
  )
}
