import React, { useEffect } from 'react'
import styled from 'styled-components'

import { Legend } from '@/src/components/transactions/Legend'
import { Section } from '@/src/components/layout/Section'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs } from '@/src/components/tabs/Tabs'
import { TabsWrapper } from '@/src/components/tabs/TabsWrapper'
import { MainTitle } from '@/src/components/text/MainTitle'
import { DateTimePicker } from '@/src/components/transactions/DateTimePicker'
import {
  TransactionsFilter as Filters,
  TransactionsFilterSkeleton,
} from '@/src/components/transactions/TransactionsFilter'
import TransactionsTable from '@/src/components/transactions/TransactionsTable'
import { Wrapper } from '@/src/components/layout/Wrapper'
import { tabs } from '@/src/constants/tabs'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { getEndOfDay, getStartOfDay } from '@/src/utils/date'
import { useRouter } from 'next/router'
import { isSameString } from '@/src/utils/tools'
import SafeSuspense from '@/src/components/helpers/SafeSuspense'

const Head = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  justify-content: space-between;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    align-items: center;
    flex-direction: row;
  }
`

export const Transactions: React.FC = ({ ...restProps }) => {
  const router = useRouter()
  const activeTab = (router.query.bridge as string) || 'xDai'
  const sectionPath = 'latest-transactions'

  useEffect(() => {
    if (router.pathname == `/${sectionPath}` && !router.query.bridge) {
      router.push({ pathname: sectionPath, query: { bridge: 'xDai' } }, undefined, {
        shallow: true,
      })
    }
  }, [router])

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
  } = useTransactionsFilters({
    bridge: activeTab,
    startTimestamp: getStartOfDay(),
    endTimestamp: getEndOfDay(),
  })

  useEffect(() => {
    setBridge(activeTab)
  }, [activeTab, setBridge])

  return (
    <Wrapper {...restProps}>
      <Head>
        <MainTitle>Transactions</MainTitle>
        {filters.endTimestamp && filters.startTimestamp && (
          <DateTimePicker
            endDate={filters.endTimestamp}
            onEndDateChange={setEndTimestamp}
            onStartDateChange={setStartTimestamp}
            startDate={filters.startTimestamp}
          />
        )}
      </Head>
      <Section>
        <TabsWrapper>
          <Tabs>
            {tabs.bridgeTypes.map(({ title }, index) => (
              <TabHeader
                isActive={isSameString(activeTab, title)}
                key={index}
                onClick={() => router.push(`/${sectionPath}?bridge=${title}`)}
                title={title}
              />
            ))}
          </Tabs>
        </TabsWrapper>
        <SafeSuspense fallback={<TransactionsFilterSkeleton />}>
          <Filters
            bridge={activeTab}
            onBridgeDirectionChange={setBridgeDirection}
            onExecutedByChange={setExecutedBy}
            onHashChange={setHash}
            onResetFilters={() => resetFilters({ bridge: activeTab })}
            onSignedByChange={setSignedBy}
            onStatusChange={setStatus}
          />
        </SafeSuspense>
        <Legend />
        <TransactionsTable bridge={activeTab} filters={filters} />
      </Section>
    </Wrapper>
  )
}
