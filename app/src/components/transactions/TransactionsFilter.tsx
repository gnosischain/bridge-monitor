import { isTransactionHash } from '@/src/hooks/subgraph/useTransactions'
import { isAddress } from '@ethersproject/address'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { SearchDebounceInput } from '@/src/components/filters/SearchDebounceInput'
import FilterDropdown from '@/src/components/filters/FilterDropdown'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { TransactionStatus } from '@/types/generated/subgraph'

const Wrapper = styled.div`
  background: ${({ theme: { gradients } }) => gradients.gray};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: grid;
  grid-template-columns: 1fr;
  padding: ${({ theme: { common } }) => common.space * 4}px
    ${({ theme: { common } }) => common.space * 2}px;
  row-gap: ${({ theme: { common } }) => common.space}px;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr 1fr;

    .searchBox {
      grid-column: auto / span 2;
    }
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    column-gap: ${({ theme: { common } }) => common.space * 4}px;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 100px;
    row-gap: ${({ theme: { common } }) => common.space * 2}px;

    .searchBox {
      grid-column: auto;
    }
  }
`

const FilterWrapper = styled.div`
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
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.3rem;
  font-weight: 300;
  height: 36px;
  letter-spacing: 0.5px;
  opacity: 0.5;
  text-align: right;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-column: auto / span 3;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    grid-column: auto;
  }

  &:hover {
    color: ${({ theme: { colors } }) => colors.warning};
    opacity: 1;
  }
`

type Props = {
  bridge: string
  onHashChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSignedByChange: (value: string) => void
  onExecutedByChange: (value: string) => void
  onBridgeDirectionChange: (value: string) => void
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
      onStatusChange(statusOptions[0])
      onSignedByChange(validatorsOptions[0])
      onExecutedByChange(validatorsOptions[0])
      onBridgeDirectionChange(bridgeDirectionOptions[0])
      setResetFields(true)
    }, [
      bridgeDirectionOptions,
      onBridgeDirectionChange,
      onExecutedByChange,
      onSignedByChange,
      onStatusChange,
      statusOptions,
      validatorsOptions,
    ])

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

    return (
      <Wrapper {...restProps}>
        {/* Transactions search */}
        <FilterWrapper className="searchBox">
          <Label htmlFor="Search">Search transactions</Label>
          <SearchDebounceInput
            onChange={handleHashChange}
            onEnterValue={() => setResetFields(false)}
            placeholder="Search by Address / Txn Hash"
            reset={resetFields}
            status={error ? TextfieldStatus.error : undefined}
          />
        </FilterWrapper>
        {/* Status filter */}
        <FilterWrapper>
          <Label>Status</Label>
          <FilterDropdown
            onChange={onStatusChange}
            onEnterValue={() => setResetFields(false)}
            options={statusOptions}
            reset={resetFields}
          />
        </FilterWrapper>
        {/* Bridge Direction filter */}
        <FilterWrapper>
          <Label>Direction</Label>
          <FilterDropdown
            onChange={onBridgeDirectionChange}
            onEnterValue={() => setResetFields(false)}
            options={bridgeDirectionOptions}
            reset={resetFields}
          />
        </FilterWrapper>
        {/* Signature filter */}
        <FilterWrapper>
          <Label>Signed by</Label>
          <FilterDropdown
            onChange={onSignedByChange}
            onEnterValue={() => setResetFields(false)}
            options={validatorsOptions}
            reset={resetFields}
          />
        </FilterWrapper>
        {/* Executed filter */}
        <FilterWrapper>
          <Label>Executed by</Label>
          <FilterDropdown
            onChange={onExecutedByChange}
            onEnterValue={() => setResetFields(false)}
            options={validatorsOptions}
            reset={resetFields}
          />
        </FilterWrapper>
        <ResetButton onClick={resetFilters}>Reset filters</ResetButton>
      </Wrapper>
    )
  },
)
