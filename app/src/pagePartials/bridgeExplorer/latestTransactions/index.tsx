import React, { useEffect } from 'react'

import { Section } from '@/src/components/layout/Section'
import { TabHeader } from '@/src/pagePartials/bridgeExplorer/common/TabHeader'
import { Tabs, TabsWrapper } from '@/src/pagePartials/bridgeExplorer/common/Tabs'
import { MainTitle } from '@/src/components/text/MainTitle'
import {
  Filters,
  FiltersSkeleton,
} from '@/src/pagePartials/bridgeExplorer/latestTransactions/Filters'
import {
  Results,
  ResultsLoading,
} from '@/src/pagePartials/bridgeExplorer/latestTransactions/Results'
import { MainWrapper as Wrapper } from '@/src/components/layout/MainWrapper'
import { latestTransactions } from '@/src/constants/tabs'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { getEndOfDay, getStartOfDay } from '@/src/utils/date'
import { useRouter } from 'next/router'
import { isSameString } from '@/src/utils/tools'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'
import { latestTransactionsBaseURL } from '@/src/constants/sections'

export const LatestTransactions: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const router = useRouter()
    const activeTab = (router.query.bridge as string) || 'xDai'

    const listFilters = useTransactionsFilters({
      bridge: activeTab,
      startTimestamp: getStartOfDay(),
      endTimestamp: getEndOfDay(),
    })
    const { filters, resetFilters, setBridge } = listFilters

    useEffect(() => {
      setBridge(activeTab)
      resetFilters({
        bridge: activeTab,
        startTimestamp: getStartOfDay(),
        endTimestamp: getEndOfDay(),
      })
    }, [activeTab, setBridge, resetFilters])

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
                  onClick={() => router.push(`${latestTransactionsBaseURL}?bridge=${title}`)}
                  title={title}
                />
              ))}
            </Tabs>
          </TabsWrapper>
          <ValidatorsProvider>
            <Filters
              bridge={activeTab}
              filters={listFilters}
              onResetFilters={() =>
                resetFilters({
                  bridge: activeTab,
                  startTimestamp: getStartOfDay(),
                  endTimestamp: getEndOfDay(),
                })
              }
            />
            {latestTransactions.map(({ title }, index) => {
              return isSameString(activeTab, title) ? (
                <Results bridge={title} filters={filters} key={`${title}_transactions_${index}`} />
              ) : null
            })}
          </ValidatorsProvider>
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
        <ResultsLoading />
      </Section>
    </Wrapper>
  ),
)
