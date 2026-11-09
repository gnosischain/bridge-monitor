import React, { HTMLAttributes, useCallback, useState } from 'react'
import styled, { css } from 'styled-components'

import { isAddress } from 'viem'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { SearchDebounceInput } from '@/src/pagePartials/bridgeExplorer/latestTransactions/SearchDebounceInput'
import { FilterDropdown } from '@/src/pagePartials/bridgeExplorer/latestTransactions/FilterDropdown'
import { TransactionStatus } from '@/src/utils/transactions'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { isTransactionHash } from '@/src/utils/tools'
import { useActiveValidators } from '@/src/pagePartials/bridgeExplorer/latestTransactions/useActiveValidators'
import { BridgeDirection, Bridges } from '@/src/constants/config/bridges'
import {
  ALL_BRIDGES_OPTION,
  ALL_DIRECTIONS_OPTION,
  ALL_STATUS_OPTION,
  ALL_VALIDATORS_OPTION,
} from '@/src/constants/filters'
import { DateTimePicker } from '@/src/pagePartials/bridgeExplorer/latestTransactions/DateTimePicker'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'

const Wrapper = styled.div`
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 3);
  }
`

const CommonGridCSS = css`
  column-gap: calc(var(--theme-common-space) * 2);
  display: grid;
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    grid-template-columns: repeat(6, 1fr);
  }
`

const MainFields = styled.div`
  grid-template-columns: 1fr;

  ${CommonGridCSS};
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Label = styled.label`
  ${EyebrowCSS}

  margin-bottom: 6px;
`

const SearchWrapper = styled.div`
  align-items: center;

  ${CommonGridCSS};
`

const SearchCommonCSS = css`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-column: auto / span 2;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    grid-column: auto / span 3;
  }
`

const Search = styled(SearchDebounceInput)`
  .textfield {
    --texfield-font-size: 1.4rem;
  }

  ${SearchCommonCSS};
`

const SearchSkeleton = styled(SkeletonLoading)`
  height: 48px;

  ${SearchCommonCSS};
`

const Buttons = styled.div`
  display: flex;
  justify-content: flex-start;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    justify-content: flex-end;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    grid-column: auto / span 3;
  }
`

const Reset = styled.button`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  color: ${({ theme: { colors } }) => colors.ink};
  cursor: pointer;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.4rem;
  font-weight: 500;
  height: ${({ theme: { textField } }) => textField.height};
  padding: 0 calc(var(--theme-common-space) * 2);
  text-align: center;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.page};
  }

  &:active {
    opacity: 0.7;
  }
`

export const FiltersSkeleton: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <MainFields>
      {Array.from({ length: 6 }).map((item, index) => (
        <Field key={index}>
          <SkeletonLoading
            style={{ height: '12px', minHeight: '0', width: '40%', marginBottom: '6px' }}
          />
          <SkeletonLoading style={{ borderRadius: '12px', height: '48px' }} />
        </Field>
      ))}
    </MainFields>
    <SearchWrapper>
      <SearchSkeleton />
      <Buttons>
        <SkeletonLoading style={{ borderRadius: '12px', height: '48px', width: '110px' }} />
      </Buttons>
    </SearchWrapper>
  </Wrapper>
)

interface Props extends HTMLAttributes<HTMLDivElement> {
  filters: ReturnType<typeof useTransactionsFilters>
  onResetFilters: () => void
}

const bridgeOptions = [
  { label: ALL_BRIDGES_OPTION, value: '' },
  { label: 'xDai bridge', value: Bridges.xdai },
  { label: 'Omnibridge', value: Bridges.amb },
]

const txStatus = [
  TransactionStatus.Initiated,
  TransactionStatus.Collecting,
  TransactionStatus.Unclaimed,
  TransactionStatus.Completed,
  TransactionStatus.Error,
]

export const Filters: React.FC<Props> = ({ filters, onResetFilters, ...restProps }) => {
  const [resetFields, setResetFields] = useState<boolean>(false)

  const validatorNames = useActiveValidators(filters.filters.bridge).map((val) => val.name)

  const statusNames = txStatus.map(
    (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
  )

  const validatorsOptions = [ALL_VALIDATORS_OPTION, ...validatorNames]
  const statuses = [ALL_STATUS_OPTION, ...statusNames]
  const bridgeDirections = [
    ALL_DIRECTIONS_OPTION,
    BridgeDirection.gnosis2mainnet,
    BridgeDirection.mainnet2gnosis,
  ]

  const resetFilters = useCallback(() => {
    onResetFilters()
    setResetFields(true)
  }, [onResetFilters])

  const [error, setError] = useState<string>('')

  const {
    filters: {
      bridge,
      bridgeDirection,
      endTimestamp,
      executedBy,
      signedBy,
      startTimestamp,
      status,
    },
    setBridge,
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
          <Label>Bridge</Label>
          <FilterDropdown
            onChange={(label) =>
              setBridge(bridgeOptions.find((option) => option.label === label)?.value ?? '')
            }
            options={bridgeOptions.map(({ label }) => label)}
            value={bridgeOptions.find(({ value }) => value === bridge)?.label ?? ALL_BRIDGES_OPTION}
          />
        </Field>
        <Field>
          <Label>Status</Label>
          <FilterDropdown
            onChange={setStatus}
            options={statuses}
            value={status || ALL_STATUS_OPTION}
          />
        </Field>
        <Field>
          <Label>Direction</Label>
          <FilterDropdown
            onChange={setBridgeDirection}
            options={bridgeDirections}
            value={bridgeDirection || ALL_DIRECTIONS_OPTION}
          />
        </Field>
        <Field>
          <Label>Signed by</Label>
          <FilterDropdown
            onChange={setSignedBy}
            options={validatorsOptions}
            value={signedBy || ALL_VALIDATORS_OPTION}
          />
        </Field>
        <Field>
          <Label>Executed by</Label>
          <FilterDropdown
            onChange={setExecutedBy}
            options={validatorsOptions}
            value={executedBy || ALL_VALIDATORS_OPTION}
          />
        </Field>
      </MainFields>
      <SearchWrapper>
        <Search
          onChange={handleHashChange}
          onEnterValue={() => setResetFields(false)}
          placeholder="Search by Address / Txn Hash"
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
