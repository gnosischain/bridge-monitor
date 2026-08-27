import styled from 'styled-components'
import React, { useMemo } from 'react'

import { Loading } from '@/src/components/loading'
import { ShareResults } from '@/src/pagePartials/bridgeExplorer/search/ShareResults'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { TransactionsList } from '@/src/pagePartials/bridgeExplorer/transactionsList'
import { AnimatePresence, motion } from 'framer-motion'
import { useTransactionsWithFilters } from '@/src/hooks/useTransactions'
import { bridgeExplorerBaseURL } from '@/src/constants/sections'

const Wrapper = styled.div`
  --results-min-height: 273px; // handy to avoid layout shift when loading

  align-items: center;
  display: flex;
  flex-direction: column;
  position: relative; // just to get this over the previous element's shadow
  width: 100%;
`

const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
  width: 100%;

  .noResultsMessage {
    min-height: var(--results-min-height);
  }
`

const Spinner = styled(Loading)`
  margin: auto;
  min-height: var(--results-min-height);
`

const InfoWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: 20px;
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`

const Info = styled.p`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  text-align: center;
`

const ShareButton = styled(ShareResults)`
  margin: 0 auto;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    margin: 0;
  }
`

export const Results: React.FC<{ filters: TransactionFilter }> = ({ filters, ...restProps }) => {
  const { claimActions, isLoading, transactions } = useTransactionsWithFilters(filters)
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
                    <ShareButton value={`${window.location.origin}${searchResultsURL}`} />
                  </InfoWrapper>
                ) : null}
                <TransactionsList
                  claimActions={claimActions}
                  goBackURL={searchResultsURL}
                  transactions={transactions}
                />
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
