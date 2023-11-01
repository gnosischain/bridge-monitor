import { isAddress } from '@ethersproject/address'
import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { SearchDebounceInput } from '@/src/components/filters/SearchDebounceInput'
import FilterDropdown from '@/src/components/filters/FilterDropdown'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { TransactionStatus } from '@/types/generated/subgraph'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { isTransactionHash } from '@/src/utils/tools'

const Wrapper = styled.div`
  background: ${({ theme: { gradients } }) => gradients.gray};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: grid;
  grid-template-columns: 1fr;
  padding: ${({ theme: { common } }) => common.space * 4}px
    ${({ theme: { common } }) => common.space * 2}px;
  row-gap: ${({ theme: { common } }) => common.space}px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr 1fr;

    &:first-child {
      grid-column: auto / span 2;
    }
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    column-gap: ${({ theme: { common } }) => common.space * 4}px;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 100px;
    row-gap: ${({ theme: { common } }) => common.space * 2}px;

    &:first-child {
      grid-column: auto;
    }
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space}px;
`

const Label = styled.label`
  font-size: 1.4rem;
`

const ResetButton = styled.button`
  align-self: end;
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.textColor};
  cursor: pointer;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.3rem;
  font-weight: 400;
  height: 36px;
  letter-spacing: 0.5px;
  opacity: 0.9;
  text-align: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-column: auto / span 3;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-column: auto;
  }

  &:hover {
    color: ${({ theme: { colors } }) => colors.warning};
    opacity: 1;
  }

  &:active {
    opacity: 0.7;
  }
`
interface Props extends HTMLAttributes<HTMLDivElement> {
  bridge: string
  onBridgeDirectionChange: (value: string) => void
  onExecutedByChange: (value: string) => void
  onHashChange: (value: string) => void
  onResetFilters: () => void
  onSignedByChange: (value: string) => void
  onStatusChange: (value: string) => void
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

export const TransactionsFilter: React.FC<Props> = genericSuspense(
  ({
    bridge,
    onBridgeDirectionChange,
    onExecutedByChange,
    onHashChange,
    onResetFilters,
    onSignedByChange,
    onStatusChange,
    ...restProps
  }) => {
    const { validators } = useFetchValidators(bridge)
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
        <Column>
          <Label htmlFor="search">Search transactions</Label>
          <SearchDebounceInput
            onChange={handleHashChange}
            onEnterValue={() => setResetFields(false)}
            placeholder="Search by Address / Txn Hash"
            reset={resetFields}
            status={error ? TextfieldStatus.error : undefined}
          />
        </Column>
        <Column>
          <Label>Status</Label>
          <FilterDropdown
            onChange={onStatusChange}
            onEnterValue={() => setResetFields(false)}
            options={statusOptions}
            reset={resetFields}
          />
        </Column>
        <Column>
          <Label>Direction</Label>
          <FilterDropdown
            onChange={onBridgeDirectionChange}
            onEnterValue={() => setResetFields(false)}
            options={bridgeDirectionOptions}
            reset={resetFields}
          />
        </Column>
        <Column>
          <Label>Signed by</Label>
          <FilterDropdown
            onChange={onSignedByChange}
            onEnterValue={() => setResetFields(false)}
            options={validatorsOptions}
            reset={resetFields}
          />
        </Column>
        <Column>
          <Label>Executed by</Label>
          <FilterDropdown
            onChange={onExecutedByChange}
            onEnterValue={() => setResetFields(false)}
            options={validatorsOptions}
            reset={resetFields}
          />
        </Column>
        <ResetButton onClick={resetFilters}>Reset filters</ResetButton>
      </Wrapper>
    )
  },
  ({ className }) => (
    <Wrapper className={className}>
      {Array.from({ length: 5 }).map((item, index) => (
        <Column key={index}>
          <SkeletonLoading style={{ height: '21px', width: '40%' }} />
          <SkeletonLoading style={{ height: '36px' }} />
        </Column>
      ))}
      <SkeletonLoading style={{ height: '36px', marginTop: 'auto' }} />
    </Wrapper>
  ),
)
