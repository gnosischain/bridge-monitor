import styled from 'styled-components'

import { Legend } from '@/src/components/assets/Legend'
import { Section } from '@/src/components/layout/Section'
import { TabContent } from '@/src/components/tabs/TabContent'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs } from '@/src/components/tabs/Tabs'
import { TabsWrapper } from '@/src/components/tabs/TabsWrapper'
import { MainTitle } from '@/src/components/text/MainTitle'
import { DateTimePicker } from '@/src/components/transactions/DateTimePicker'
import { TransactionsFilter as Filters } from '@/src/components/transactions/TransactionsFilter'
import TransactionsTable from '@/src/components/transactions/TransactionsTable'
import { tabs } from '@/src/constants/tabs'
import { TransactionFilter, useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { useGeneral } from '@/src/providers/generalProvider'
import React, { useEffect } from 'react'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Loading } from '@/src/components/loading/Loading'

const Head = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  justify-content: space-between;
  padding-bottom: ${({ theme: { common } }) => common.space * 2}px;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    align-items: center;
    flex-direction: row;
    padding-bottom: ${({ theme: { common } }) => common.space * 4}px;
  }
`

const Title = styled(MainTitle)`
  margin: 0;
`

const Spinner = styled(Loading)`
  height: 200px;
`

const List: React.FC<{
  title: string
  filters: TransactionFilter
}> = genericSuspense(
  ({ filters, title }) => {
    return (
      <TabContent title={title}>
        <TransactionsTable bridge={title} filters={filters} />
      </TabContent>
    )
  },
  () => <Spinner />,
)

export const Transactions: React.FC = () => {
  const {
    filters,
    resetFilters,
    setBridge,
    setBridgeDirection,
    setEndTimestamp,
    setExecutedBy,
    setHash,
    setSignedBy,
    setStartTimestamp,
    setStatus,
  } = useTransactionsFilters()

  const { transactions } = tabs
  const { activeTab } = useGeneral()

  useEffect(() => {
    resetFilters()
    setBridge(activeTab)
  }, [activeTab, resetFilters, setBridge])

  return (
    <>
      <Head>
        <Title>Transactions</Title>
        <DateTimePicker
          endDate={filters.endTimestamp}
          onEndDateChange={setEndTimestamp}
          onStartDateChange={setStartTimestamp}
          startDate={filters.startTimestamp}
        />
      </Head>
      <Section>
        <TabsWrapper>
          <Tabs>
            {transactions.map(({ title }, index) => (
              <TabHeader
                key={index}
                onClick={(t) => {
                  resetFilters()
                  setBridge(t)
                }}
                title={title}
              />
            ))}
          </Tabs>
        </TabsWrapper>
        <Filters
          bridge={activeTab}
          onBridgeDirectionChange={setBridgeDirection}
          onExecutedByChange={setExecutedBy}
          onHashChange={setHash}
          onSignedByChange={setSignedBy}
          onStatusChange={setStatus}
        />
        <Legend />
        {transactions.map(({ title }, index) => (
          <List filters={filters} key={index} title={title} />
        ))}
      </Section>
    </>
  )
}
