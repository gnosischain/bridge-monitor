import styled from 'styled-components'

import { SearchDebounceInput } from '../filters/SearchDebounceInput'
import FilterDropdown from '@/src/components/filters/FilterDropdown'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { TransactionStatus } from '@/types/generated/subgraph'

const Wrapper = styled.div`
  padding: ${({ theme: { common } }) => common.space * 4}px
    ${({ theme: { common } }) => common.space * 2}px;
  background: ${({ theme: { gradients } }) => gradients.gray};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr 1fr;
    .searchBox {
      grid-column: auto / span 3;
    }
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    gap: ${({ theme: { common } }) => common.space * 4}px;
    grid-template-columns: 2fr 1fr 1fr 1fr;
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

type Props = {
  bridge: string
  onHashChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSignatureByChange: (value: string) => void
  onExecutedByChange: (value: string) => void
}

type StatusOption = TransactionStatus | 'All Status'
type ValidatorOption = string

export const TransactionsFilter: React.FC<Props> = ({
  bridge,
  onExecutedByChange,
  onHashChange,
  onSignatureByChange,
  onStatusChange,
}) => {
  const { validators } = useFetchValidators(bridge)
  const validatorNames = validators.map((val) => val.name)

  const statusOptions: StatusOption[] = [
    'All Status',
    TransactionStatus.Completed,
    TransactionStatus.Pending,
  ]
  const validatorsOptions: ValidatorOption[] = ['All Validators'].concat(validatorNames)

  return (
    <Wrapper>
      {/* Transactions search */}
      <FilterWrapper className="searchBox">
        <Label htmlFor="Search">Search transactions</Label>
        <SearchDebounceInput onChange={onHashChange} placeholder="Search by Address / Txn Hash" />
      </FilterWrapper>
      {/* Status filter */}
      <FilterWrapper>
        <Label>Status</Label>
        <FilterDropdown onChange={onStatusChange} options={statusOptions} />
      </FilterWrapper>
      {/* Signature filter */}
      <FilterWrapper>
        <Label>Signature by</Label>
        <FilterDropdown onChange={onSignatureByChange} options={validatorsOptions} />
      </FilterWrapper>
      {/* Executed filter */}
      <FilterWrapper>
        <Label>Executed by</Label>
        <FilterDropdown onChange={onExecutedByChange} options={validatorsOptions} />
      </FilterWrapper>
    </Wrapper>
  )
}
