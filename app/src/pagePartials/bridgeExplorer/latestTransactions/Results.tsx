import styled from 'styled-components'
import { Info } from '@/src/pagePartials/bridgeExplorer/latestTransactions/Info'
import { TransactionsList } from '@/src/pagePartials/bridgeExplorer/transactionsList'
import { useTransactionsWithFilters } from '@/src/hooks/subgraph/useTransactions'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { Loading } from '@/src/components/loading'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'
import { Legend } from '@/src/pagePartials/bridgeExplorer/latestTransactions/Legend'
import { latestTransactionsBaseURL } from '@/src/constants/sections'

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

export const ResultsLoading = styled(Loading)`
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
    <ResultsLoading />
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
        goBackURL={latestTransactionsBaseURL}
        transactions={transactions}
        updateInMemoryTransaction={updateInMemoryTransaction}
        validators={validators}
      />
    </>
  )
}
