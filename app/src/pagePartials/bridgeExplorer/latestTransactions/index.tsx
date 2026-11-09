import React, { useEffect } from 'react'

import styled from 'styled-components'
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
import { Bridges } from '@/src/constants/config/bridges'

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

export const LatestTransactions: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const router = useRouter()
    // Every bridge by default; `?bridge=` (links to the former per-bridge tabs) preselects one.
    const queryBridge =
      [Bridges.xdai, Bridges.amb].find((bridge) =>
        isSameString(bridge, String(router.query.bridge ?? '')),
      ) ?? ''

    const listFilters = useTransactionsFilters({
      bridge: queryBridge,
      startTimestamp: getStartOfDay(),
      endTimestamp: getEndOfDay(),
    })
    const { filters, resetFilters } = listFilters

    useEffect(() => {
      resetFilters({
        bridge: queryBridge,
        startTimestamp: getStartOfDay(),
        endTimestamp: getEndOfDay(),
      })
    }, [queryBridge, resetFilters])

    return (
      <Wrapper {...restProps}>
        <PageHeader eyebrow="Bridge Explorer" title="Latest transactions" />
        <Card>
          <OptionalValidatorsProvider>
            <Filters
              filters={listFilters}
              onResetFilters={() =>
                resetFilters({ startTimestamp: getStartOfDay(), endTimestamp: getEndOfDay() })
              }
            />
            <Results filters={filters} />
          </OptionalValidatorsProvider>
        </Card>
      </Wrapper>
    )
  },
  ({ ...restProps }) => (
    <Wrapper {...restProps}>
      <PageHeader eyebrow="Bridge Explorer" title="Latest transactions" />
      <Card>
        <FiltersSkeleton />
        <ResultsLoading />
      </Card>
    </Wrapper>
  ),
)
