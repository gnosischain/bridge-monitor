import styled from 'styled-components'

import { Legend } from '@/src/components/assets/Legend'
import { Section } from '@/src/components/layout/Section'
import { TabContent } from '@/src/components/tabs/TabContent'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs } from '@/src/components/tabs/Tabs'
import { TabsWrapper } from '@/src/components/tabs/TabsWrapper'
import { MainTitle } from '@/src/components/text/MainTitle'
import { DateTimePicker } from '@/src/components/transactions/DateTimePicker'
import { TransactionsFilter } from '@/src/components/transactions/TransactionsFilter'
import TransactionsTable from '@/src/components/transactions/TransactionsTable'
import { tabs } from '@/src/constants/tabs'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'

const Title = styled.div`
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

  h1 {
    margin: 0;
  }
`

interface Props {
  bridge?: string
}

export const Transactions: React.FC<Props> = ({ bridge }) => {
  const {
    filters,
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

  return (
    <>
      <Title>
        <MainTitle>Transactions</MainTitle>
        <DateTimePicker
          endDate={filters.endTimestamp}
          onEndDateChange={setEndTimestamp}
          onStartDateChange={setStartTimestamp}
          startDate={filters.startTimestamp}
        />
      </Title>
      <Section>
        <TabsWrapper>
          <Tabs>
            {transactions.map(({ title }, index) => (
              <TabHeader key={index} onClick={setBridge} title={title} />
            ))}
          </Tabs>
        </TabsWrapper>
        {transactions.map(({ title }, index) => (
          <TabContent key={index} title={title}>
            <TransactionsFilter
              bridge={title}
              onBridgeDirectionChange={setBridgeDirection}
              onExecutedByChange={setExecutedBy}
              onHashChange={setHash}
              onSignedByChange={setSignedBy}
              onStatusChange={setStatus}
            />
            <Legend />
            <TransactionsTable bridge={title} filters={filters}></TransactionsTable>
          </TabContent>
        ))}
      </Section>
    </>
  )
}
