import styled from 'styled-components'
import React, { useMemo } from 'react'

import { Loading } from '@/src/components/loading/Loading'
import { ShareResults } from '@/src/components/searchByHash/ShareResults'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { TransactionsList } from '@/src/components/transactions/TransactionsList'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useTransactionsWithFilters } from '@/src/hooks/subgraph/useTransactions'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: 16px;
  width: 100%;
`

const Spinner = styled(Loading)`
  margin: auto;
`

const InfoWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: 20px;
  padding: 24px 16px;
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`

const Info = styled.p`
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.2;
  color: ${({ theme: { colors } }) => colors.textColor};
  font-weight: 400;
  text-align: center;
`

const ShareButton = styled(ShareResults)`
  margin: 0 auto;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    margin: 0;
  }
`

const List = styled(TransactionsList)`
  background-color: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: 16px;
  margin: 0;
`

export const Results: React.FC<{ filters: TransactionFilter }> = ({ filters, ...restProps }) => {
  const router = useRouter()
  const { isLoading, transactions, updateInMemoryTransaction } = useTransactionsWithFilters(filters)
  const filtersHash = useMemo(() => `?hash=${filters.hash}`, [filters.hash])

  return (
    <Wrapper
      animate={filters.hash ? { opacity: 1, flexGrow: 1, height: 'auto' } : undefined}
      as={motion.div}
      initial={{ opacity: 1, flexGrow: 0, height: '0', overflow: 'hidden' }}
      transition={{ duration: 0.35 }}
      {...restProps}
    >
      {isLoading && <Spinner text="Searching..." />}
      {!isLoading && (
        <>
          {transactions.length ? (
            <InfoWrapper>
              <Info>
                <b>{transactions.length}</b> transactions found
              </Info>
              <ShareButton value={`${window.location.origin}/${filtersHash}`} />
            </InfoWrapper>
          ) : null}
          <List
            goBackUrl={filters.hash ? `${router.asPath}${filtersHash}` : `${router.asPath}`}
            shallowUrl={`${router.pathname}?hash=${filters.hash}`}
            transactions={transactions}
            updateInMemoryTransaction={updateInMemoryTransaction}
          />
        </>
      )}
    </Wrapper>
  )
}
