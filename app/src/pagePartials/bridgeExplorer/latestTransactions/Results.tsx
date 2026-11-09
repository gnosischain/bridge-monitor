import styled from 'styled-components'
import format from 'date-fns/format'
import { Info } from '@/src/pagePartials/bridgeExplorer/latestTransactions/Info'
import { TransactionsList } from '@/src/pagePartials/bridgeExplorer/transactionsList'
import { useTransactionsWithFilters } from '@/src/hooks/useTransactions'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { Loading } from '@/src/components/loading'
import { useActiveValidators } from '@/src/pagePartials/bridgeExplorer/latestTransactions/useActiveValidators'
import { Legend } from '@/src/pagePartials/bridgeExplorer/latestTransactions/Legend'
import { latestTransactionsBaseURL } from '@/src/constants/sections'
import { DAY_FORMAT } from '@/src/utils/date'

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 2) 0;
  row-gap: calc(var(--theme-common-space) * 1.5);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2.5) calc(var(--theme-common-space) * 3) 0;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`

export const ResultsLoading = styled(Loading)`
  min-height: 400px;
`

const TransactionsWrapper = styled.div`
  padding: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3)
      calc(var(--theme-common-space) * 3);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    padding: var(--theme-common-space) 0 calc(var(--theme-common-space) * 2);
  }
`

type TransactionsTableProps = {
  filters: TransactionFilter
}

export const Results: React.FC<TransactionsTableProps> = ({ filters }) => {
  const { claimActions, isError, isLoading, transactions } = useTransactionsWithFilters(filters)
  const validators = useActiveValidators(filters.bridge)

  return isLoading ? (
    <ResultsLoading />
  ) : (
    <>
      {/* Without a fetched list, "0 transactions were made" would be false. */}
      {!isError && (
        <InfoWrapper>
          <Info
            date={filters.endTimestamp && format(filters.endTimestamp, DAY_FORMAT)}
            transactionsNumber={transactions.length}
          />
          <Legend />
        </InfoWrapper>
      )}
      <TransactionsWrapper>
        <TransactionsList
          claimActions={claimActions}
          goBackURL={latestTransactionsBaseURL}
          isError={isError}
          transactions={transactions}
          validators={validators}
        />
      </TransactionsWrapper>
    </>
  )
}
