import React, { useEffect } from 'react'

import { Section } from '@/src/components/layout/Section'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs, TabsWrapper } from '@/src/components/tabs/Tabs'
import { MainTitle } from '@/src/components/text/MainTitle'
import {
  FiltersSkeleton,
  TransactionsFilter,
} from '@/src/pagePartials/latestTransactions/TransactionsFilter'
import { Results } from '@/src/pagePartials/latestTransactions/Results'
import { Wrapper } from '@/src/components/layout/Wrapper'
import { latestTransactions } from '@/src/constants/tabs'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { getEndOfDay, getStartOfDay } from '@/src/utils/date'
import { useRouter } from 'next/router'
import { isSameString } from '@/src/utils/tools'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'

export const Transactions: React.FC = genericSuspense(
  ({ ...restProps }) => {
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
        <MainTitle>Transactions</MainTitle>
        <Section>
          <TabsWrapper>
            <Tabs>
              {latestTransactions.map(({ title }, index) => (
                <TabHeader
                  isActive={isSameString(activeTab, title)}
                  key={index}
                  onClick={() => router.push(`/${sectionPath}?bridge=${title}`)}
                  title={title}
                />
              ))}
            </Tabs>
          </TabsWrapper>
          <TransactionsFilter
            bridge={activeTab}
            endDate={filters.endTimestamp}
            onBridgeDirectionChange={setBridgeDirection}
            onEndDateChange={setEndTimestamp}
            onExecutedByChange={setExecutedBy}
            onHashChange={setHash}
            onResetFilters={() =>
              resetFilters({
                bridge: activeTab,
                startTimestamp: getStartOfDay(),
                endTimestamp: getEndOfDay(),
              })
            }
            onSignedByChange={setSignedBy}
            onStartDateChange={setStartTimestamp}
            onStatusChange={setStatus}
            startDate={filters.startTimestamp}
          />
          {latestTransactions.map(({ title }, index) => {
            return isSameString(activeTab, title) ? (
              <Results bridge={title} filters={filters} key={`${title}_transactions_${index}`} />
            ) : null
          })}
        </Section>
      </Wrapper>
    )
  },
  ({ ...restProps }) => (
    <Wrapper {...restProps}>
      <MainTitle>Transactions</MainTitle>
      <Section>
        <TabsWrapper>
          <Tabs>
            {latestTransactions.map(({ title }, index) => (
              <TabHeader
                isActive={index === 0}
                key={index}
                onClick={() => {
                  return false
                }}
                title={title}
              />
            ))}
          </Tabs>
        </TabsWrapper>
        <FiltersSkeleton />
      </Section>
    </Wrapper>
  ),
)
