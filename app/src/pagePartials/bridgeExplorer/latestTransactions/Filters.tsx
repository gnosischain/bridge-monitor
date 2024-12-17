import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { isAddress } from '@ethersproject/address'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { SearchDebounceInput } from '@/src/pagePartials/bridgeExplorer/latestTransactions/SearchDebounceInput'
import { FilterDropdown } from '@/src/pagePartials/bridgeExplorer/latestTransactions/FilterDropdown'
import { TransactionStatus } from '@/types/generated/subgraph'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { isTransactionHash } from '@/src/utils/tools'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'
import { DateTimePicker } from '@/src/pagePartials/bridgeExplorer/latestTransactions/DateTimePicker'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'

const Wrapper = styled.div`
  --filter-border-radius: 4px;
  --filter-common-padding: calc(var(--theme-common-space) * 2);

  background-color: ${({ theme: { colors } }) => colors.creamDarker};
  border-radius: var(--filter-border-radius) var(--filter-border-radius) 0 0;
  margin: calc(var(--theme-common-space) * 2) var(--theme-common-space);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    margin: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2)
      calc(var(--theme-common-space) * 2);
  }
`

const CommonGridCSS = css`
  column-gap: calc(var(--theme-common-space) * 2);
  display: grid;
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
`

const MainFields = styled.div`
  grid-template-columns: 1fr;
  padding: calc(var(--theme-common-space) * 3) var(--filter-common-padding);

  ${CommonGridCSS};
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.4rem;
  line-height: 1.2;
  margin-bottom: var(--theme-common-space);
`

const SearchWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamDarkest};
  padding: var(--filter-common-padding);

  ${CommonGridCSS};
`

const SearchCommonCSS = css`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-column: auto / span 2;

    .textfield {
      --texfield-font-size: 1.6rem;
    }
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-column: auto / span 3;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-column: auto / span 2;
  }
`

const Search = styled(SearchDebounceInput)`
  .textfield {
    --texfield-font-size: 1.4rem;
    --textfield-height: calc(${({ theme: { textField } }) => textField.height} + 2px);
  }

  ${SearchCommonCSS};
`

const SearchSkeleton = styled(SkeletonLoading)`
  height: 44px;

  ${SearchCommonCSS};
`

const Buttons = styled.div`
  display: flex;
  justify-content: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    justify-content: flex-end;
    grid-column: auto / span 2;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-column: auto / span 3;
  }
`

const Reset = styled.button`
  background-color: transparent;
  border-radius: 8px;
  border: 1px solid ${({ theme: { colors } }) => colors.primary_60};
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.4rem;
  font-weight: 400;
  height: 42px;
  padding: 0 calc(var(--theme-common-space) * 2);
  text-align: center;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.primary};
    border-color: ${({ theme: { colors } }) => colors.primary};
    color: ${({ theme: { colors } }) => colors.cream};
  }

  &:active {
    opacity: 0.7;
  }
`

export const FiltersSkeleton: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <MainFields>
      {Array.from({ length: 5 }).map((item, index) => (
        <Field key={index}>
          <SkeletonLoading
            style={{ height: '16.8px', minHeight: '0', width: '40%', marginBottom: '8px' }}
          />
          <SkeletonLoading style={{ height: '42px' }} />
        </Field>
      ))}
    </MainFields>
    <SearchWrapper>
      <SearchSkeleton />
      <Buttons>
        <SkeletonLoading style={{ height: '36px', width: '90px' }} />
      </Buttons>
    </SearchWrapper>
  </Wrapper>
)

interface Props extends HTMLAttributes<HTMLDivElement> {
  bridge: string
  filters: ReturnType<typeof useTransactionsFilters>
  onResetFilters: () => void
}

export enum BridgeDirection {
  gnosis2mainnet = 'Gnosis > Mainnet',
  mainnet2gnosis = 'Mainnet > Gnosis',
}

const txStatus = [
  TransactionStatus.Initiated,
  TransactionStatus.Collecting,
  TransactionStatus.Unclaimed,
  TransactionStatus.Completed,
  TransactionStatus.Error,
]

export const Filters: React.FC<Props> = ({ bridge, filters, onResetFilters, ...restProps }) => {
  const { validators } = useValidators(bridge as BridgesValues)
  const [resetFields, setResetFields] = useState<boolean>(false)

  const validatorNames = validators.map((val) => val.name)
  const statusNames = txStatus.map(
    (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
  )

  const validatorsOptions = ['All Validators'].concat(validatorNames)
  const statuses = ['All Status'].concat(statusNames)
  const bridgeDirections = [
    'All Directions',
    BridgeDirection.gnosis2mainnet,
    BridgeDirection.mainnet2gnosis,
  ]

  const resetFilters = useCallback(() => {
    onResetFilters()
    setResetFields(true)
  }, [onResetFilters])

  const [error, setError] = useState<string>('')

  const {
    filters: { bridgeDirection, endTimestamp, executedBy, signedBy, startTimestamp, status },
    setBridgeDirection,
    setEndTimestamp,
    setExecutedBy,
    setHash,
    setSignedBy,
    setStartTimestamp,
    setStatus,
  } = filters

  const handleHashChange = (value: string) => {
    setError('')

    if (isTransactionHash(value) || isAddress(value)) {
      setHash(value)
    } else if (value !== '') {
      setError('Invalid hash')
    } else {
      setHash('')
    }
  }

  useEffect(() => {
    setResetFields(true)
  }, [bridge])

  return (
    <Wrapper {...restProps}>
      <MainFields>
        <Field>
          <Label>Date</Label>
          {endTimestamp && startTimestamp && (
            <DateTimePicker
              endDate={endTimestamp}
              onEndDateChange={setEndTimestamp}
              onStartDateChange={setStartTimestamp}
              startDate={startTimestamp}
            />
          )}
        </Field>
        <Field>
          <Label>Status</Label>
          <FilterDropdown onChange={setStatus} options={statuses} value={status || 'All Status'} />
        </Field>
        <Field>
          <Label>Direction</Label>
          <FilterDropdown
            onChange={setBridgeDirection}
            options={bridgeDirections}
            value={bridgeDirection || 'All Directions'}
          />
        </Field>
        <Field>
          <Label>Signed by</Label>
          <FilterDropdown
            onChange={setSignedBy}
            options={validatorsOptions}
            value={signedBy || 'All Validators'}
          />
        </Field>
        <Field>
          <Label>Executed by</Label>
          <FilterDropdown
            onChange={setExecutedBy}
            options={validatorsOptions}
            value={executedBy || 'All Validators'}
          />
        </Field>
      </MainFields>
      <SearchWrapper>
        <Search
          onChange={handleHashChange}
          onEnterValue={() => setResetFields(false)}
          placeholder="Search by Address 999/ Txn Hash"
          reset={resetFields}
          status={error ? TextfieldStatus.error : undefined}
        />
        <Buttons>
          <Reset onClick={resetFilters}>Reset filters</Reset>
        </Buttons>
      </SearchWrapper>
    </Wrapper>
  )
}
