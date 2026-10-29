import React, { useEffect } from 'react'

import styled from 'styled-components'
import { TabHeader } from '@/src/pagePartials/bridgeExplorer/common/TabHeader'
import { Tabs } from '@/src/pagePartials/bridgeExplorer/common/Tabs'
import { PageHeader } from '@/src/components/pageHeader'
import {
  Filters,
  FiltersSkeleton,
} from '@/src/pagePartials/bridgeExplorer/latestTransactions/Filters'
import {
  Results,
  ResultsLoading,
} from '@/src/pagePartials/bridgeExplorer/latestTransactions/Results'
import { MainCard } from '@/src/components/card/MainCard'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { getEndOfDay, getStartOfDay } from '@/src/utils/date'
import { useRouter } from 'next/router'
import { isSameString } from '@/src/utils/tools'
import { genericSuspense } from '@/src/components/safeSuspense'
import { OptionalValidatorsProvider } from '@/src/providers/validatorsProvider'
import { latestTransactionsBaseURL } from '@/src/constants/sections'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 3);
`

// Filters, count and table share one card; the sections bring their own padding.
const Card = styled(MainCard)`
  padding: 0;
  row-gap: 0;
`

const latestTransactions: Array<{ title: string }> = [
  {
    title: 'xDai',
  },
  {
    title: 'AMB',
  },
]

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
        <PageHeader
          aside={
            <Tabs aria-label="Bridge">
              {latestTransactions.map(({ title }, index) => (
                <TabHeader
                  $isActive={isSameString(activeTab, title)}
                  key={index}
                  onClick={() => router.push(`${latestTransactionsBaseURL}?bridge=${title}`)}
                  title={title}
                />
              ))}
            </Tabs>
          }
          eyebrow="Bridge Explorer"
          title="Latest transactions"
        />
        <Card>
          <OptionalValidatorsProvider>
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
          </OptionalValidatorsProvider>
        </Card>
      </Wrapper>
    )
  },
  ({ ...restProps }) => (
    <Wrapper {...restProps}>
      <PageHeader
        aside={
          <Tabs aria-label="Bridge">
            {latestTransactions.map(({ title }, index) => (
              <TabHeader
                $isActive={index === 0}
                key={index}
                onClick={() => {
                  return false
                }}
                title={title}
              />
            ))}
          </Tabs>
        }
        eyebrow="Bridge Explorer"
        title="Latest transactions"
      />
      <Card>
        <FiltersSkeleton />
        <ResultsLoading />
      </Card>
    </Wrapper>
  ),
)
