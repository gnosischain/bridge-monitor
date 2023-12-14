import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { isAddress } from '@ethersproject/address'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { SearchDebounceInput } from '@/src/components/filters/SearchDebounceInput'
import { FilterDropdown } from '@/src/components/filters/FilterDropdown'
import { TransactionStatus } from '@/types/generated/subgraph'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { isTransactionHash } from '@/src/utils/tools'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'
import { DateTimePicker } from '@/src/pagePartials/latestTransactions/DateTimePicker'

const Wrapper = styled.div`
  --filter-border-radius: ${({ theme: { common } }) => common.borderRadius};
  --filter-common-padding: ${({ theme: { common } }) => common.space * 2}px;

  background: ${({ theme: { gradients } }) => gradients.gray};
  border-radius: var(--filter-border-radius) var(--filter-border-radius) 0 0;
`

const CommonGridCSS = css`
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: grid;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;

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
  padding: ${({ theme: { common } }) => common.space * 3}px var(--filter-common-padding);

  ${CommonGridCSS};
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  font-size: 1.4rem;
  line-height: 1.2;
  margin-bottom: ${({ theme: { common } }) => common.space}px;
`

const SearchWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  padding: var(--filter-common-padding);

  ${CommonGridCSS};
`

const Search = styled(SearchDebounceInput)`
  .textfield {
    --texfield-font-size: 1.4rem;
    --textfield-height: calc(var(--input-height) + 2px);
  }

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
  border: none;
  color: ${({ theme: { colors } }) => colors.secondary};
  cursor: pointer;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.4rem;
  font-weight: 400;
  height: 36px;
  opacity: 0.9;
  text-align: center;

  &:hover {
    color: ${({ theme: { colors } }) => colors.warning};
    opacity: 1;
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
          <SkeletonLoading style={{ height: '21px', width: '40%' }} />
          <SkeletonLoading style={{ height: '36px' }} />
        </Field>
      ))}
    </MainFields>
    <SearchWrapper>
      <SkeletonLoading style={{ height: '36px' }} />
      <Buttons>
        <SkeletonLoading style={{ height: '36px', width: '80px' }} />
      </Buttons>
    </SearchWrapper>
  </Wrapper>
)

interface Props extends HTMLAttributes<HTMLDivElement> {
  bridge: string
  endDate: Date | undefined
  onBridgeDirectionChange: (value: string) => void
  onEndDateChange: (date: Date) => void
  onExecutedByChange: (value: string) => void
  onHashChange: (value: string) => void
  onResetFilters: () => void
  onSignedByChange: (value: string) => void
  onStartDateChange: (date: Date) => void
  onStatusChange: (value: string) => void
  startDate: Date | undefined
}

export enum BridgeDirection {
  gnosis2mainnet = 'Gnosis > Mainnet',
  mainnet2gnosis = 'Mainnet > Gnosis',
}

type BridgeDirectionOption = BridgeDirection | 'All Directions'

type StatusOption = string

const txStatus = [
  TransactionStatus.Initiated,
  TransactionStatus.Collecting,
  TransactionStatus.Unclaimed,
  TransactionStatus.Completed,
  TransactionStatus.Error,
]

type ValidatorOption = string

export const TransactionsFilter: React.FC<Props> = ({
  bridge,
  endDate,
  onBridgeDirectionChange,
  onEndDateChange,
  onExecutedByChange,
  onHashChange,
  onResetFilters,
  onSignedByChange,
  onStartDateChange,
  onStatusChange,
  startDate,
  ...restProps
}) => {
  const { validators } = useValidators(bridge as BridgesValues)
  const validatorNames = validators.map((val) => val.name)
  const validatorsOptions: ValidatorOption[] = ['All Validators'].concat(validatorNames)

  const bridgeDirectionOptions: BridgeDirectionOption[] = useMemo(
    () => ['All Directions', BridgeDirection.gnosis2mainnet, BridgeDirection.mainnet2gnosis],
    [],
  )

  const statusNames = txStatus.map(
    (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
  )

  const statusOptions: StatusOption[] = ['All Status'].concat(statusNames)
  const [resetFields, setResetFields] = useState<boolean>(false)

  const resetFilters = useCallback(() => {
    onResetFilters()
    setResetFields(true)
  }, [onResetFilters])

  const [error, setError] = useState<string>('')
  const handleHashChange = (value: string) => {
    setError('')

    if (isTransactionHash(value) || isAddress(value)) {
      onHashChange(value)
    } else if (value !== '') {
      setError('Invalid hash')
    } else {
      onHashChange('')
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
          {endDate && startDate && (
            <DateTimePicker
              endDate={endDate}
              onEndDateChange={onEndDateChange}
              onStartDateChange={onStartDateChange}
              startDate={startDate}
            />
          )}
        </Field>
        <Field>
          <Label>Status</Label>
          <FilterDropdown
            onChange={onStatusChange}
            onEnterValue={() => setResetFields(false)}
            options={statusOptions}
            reset={resetFields}
          />
        </Field>
        <Field>
          <Label>Direction</Label>
          <FilterDropdown
            onChange={onBridgeDirectionChange}
            onEnterValue={() => setResetFields(false)}
            options={bridgeDirectionOptions}
            reset={resetFields}
          />
        </Field>
        <Field>
          <Label>Signed by</Label>
          <FilterDropdown
            onChange={onSignedByChange}
            onEnterValue={() => setResetFields(false)}
            options={validatorsOptions}
            reset={resetFields}
          />
        </Field>
        <Field>
          <Label>Executed by</Label>
          <FilterDropdown
            onChange={onExecutedByChange}
            onEnterValue={() => setResetFields(false)}
            options={validatorsOptions}
            reset={resetFields}
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
