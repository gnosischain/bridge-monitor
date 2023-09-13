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
