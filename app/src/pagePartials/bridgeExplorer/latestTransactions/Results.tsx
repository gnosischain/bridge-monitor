import styled from 'styled-components'
import { Info } from '@/src/pagePartials/bridgeExplorer/latestTransactions/Info'
import { TransactionsList } from '@/src/pagePartials/bridgeExplorer/transactionsList'
import { useTransactionsWithFilters } from '@/src/hooks/useTransactions'
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
  padding: 0 var(--theme-common-space) calc(var(--theme-common-space) * 3);
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 calc(var(--theme-common-space) * 4) calc(var(--theme-common-space) * 3);
  }
`

export const ResultsLoading = styled(Loading)`
  min-height: 400px;
`

const TransactionsWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 16px;
  margin: 0 2px 2px 2px;
  padding: calc(var(--theme-common-space) / 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 1);
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding: calc(var(--theme-common-space) * 2);
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    padding: var(--theme-common-space) 0 calc(var(--theme-common-space) * 5);
  }
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
      <TransactionsWrapper>
        <TransactionsList
          goBackURL={latestTransactionsBaseURL}
          transactions={transactions}
          updateInMemoryTransaction={updateInMemoryTransaction}
          validators={validators}
        />
      </TransactionsWrapper>
    </>
  )
}
