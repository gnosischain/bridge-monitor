import styled from 'styled-components'
import React, { useMemo } from 'react'

import { Loading } from '@/src/components/loading'
import { ShareResults } from '@/src/pagePartials/bridgeExplorer/search/ShareResults'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { TransactionsList } from '@/src/pagePartials/bridgeExplorer/transactionsList'
import { AnimatePresence, motion } from 'framer-motion'
import { useTransactionsWithFilters } from '@/src/hooks/useTransactions'
import { bridgeExplorerBaseURL } from '@/src/constants/sections'
import { MainCard } from '@/src/components/card/MainCard'

const Wrapper = styled.div`
  --results-min-height: 273px; // handy to avoid layout shift when loading

  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`

const ResultsWrapper = styled(MainCard)`
  padding: 0;
  row-gap: 0;

  .noResultsMessage {
    min-height: var(--results-min-height);
  }
`

const Spinner = styled(Loading)`
  margin: auto;
  min-height: var(--results-min-height);
`

const InfoWrapper = styled.div`
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 1.5);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
  }
`

const Info = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;

  b {
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 600;
  }
`

const TransactionsWrapper = styled.div`
  padding: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3)
      calc(var(--theme-common-space) * 3);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    padding: 0 0 calc(var(--theme-common-space) * 2);
  }
`

export const Results: React.FC<{ filters: TransactionFilter }> = ({ filters, ...restProps }) => {
  const { claimActions, isError, isLoading, transactions } = useTransactionsWithFilters(filters)
  const searchResultsURL = useMemo(
    () => `${bridgeExplorerBaseURL}?hash=${filters.hash}`,
    [filters.hash],
  )

  return (
    <AnimatePresence>
      {filters.hash ? (
        <Wrapper
          animate={{ opacity: 1, flexGrow: 1, height: 'auto' }}
          as={motion.div}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0, flexGrow: 0, height: '0', overflow: 'hidden' }}
          transition={{ duration: 0.35 }}
          {...restProps}
        >
          <AnimatePresence>
            {isLoading ? (
              <Spinner text="Searching..." />
            ) : (
              <ResultsWrapper
                animate={{ opacity: 1 }}
                as={motion.div}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {transactions.length ? (
                  <InfoWrapper>
                    <Info>
                      <b>{transactions.length}</b> transactions found
                    </Info>
                    <ShareResults value={`${window.location.origin}${searchResultsURL}`} />
                  </InfoWrapper>
                ) : null}
                <TransactionsWrapper>
                  <TransactionsList
                    claimActions={claimActions}
                    goBackURL={searchResultsURL}
                    isError={isError}
                    transactions={transactions}
                  />
                </TransactionsWrapper>
              </ResultsWrapper>
            )}
          </AnimatePresence>
        </Wrapper>
      ) : (
        <></>
      )}
    </AnimatePresence>
  )
}
