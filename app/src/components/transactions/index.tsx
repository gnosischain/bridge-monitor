import { useEffect } from 'react'
import styled from 'styled-components'

import { Legend } from '@/src/components/assets/Legend'
import { DateTimePicker } from '@/src/components/transactions/DateTimePicker'
import { TransactionsFilter } from '@/src/components/transactions/TransactionsFilter'
import TransactionsTable from '@/src/components/transactions/TransactionsTable'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: ${({ theme: { common } }) => common.space * 2}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    flex-direction: row;
    padding-bottom: ${({ theme: { common } }) => common.space * 4}px;
    align-items: center;
  }
  h1 {
    margin: 0;
  }
`

interface Props {
  bridge: string
}

export const Transactions: React.FC<Props> = ({ bridge }) => {
  const message = `${bridge} transactions`
  const {
    filters,
    setBridge,
    setEndTimestamp,
    setExecutedBy,
    setHash,
    setSignatureBy,
    setStartTimestamp,
    setStatus,
  } = useTransactionsFilters()

  useEffect(() => {
    setBridge(bridge)
  }, [setBridge, bridge])

  return (
    <section>
      <Title>
        <h1>{message}</h1>
        <DateTimePicker
          // @todo missing hour filter
          endDate={filters.endTimestamp}
          onEndDateChange={setEndTimestamp}
          onStartDateChange={setStartTimestamp}
          startDate={filters.startTimestamp}
        />
      </Title>
      <TransactionsFilter
        bridge={bridge}
        onExecutedByChange={setExecutedBy}
        onHashChange={setHash}
        onSignatureByChange={setSignatureBy}
        onStatusChange={setStatus}
      />
      <Legend />
      <div>
        <TransactionsTable bridge={bridge} filters={filters}></TransactionsTable>
      </div>
    </section>
  )
}
