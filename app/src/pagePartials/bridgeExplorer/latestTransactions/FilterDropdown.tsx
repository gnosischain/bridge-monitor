import styled, { css } from 'styled-components'

import { ButtonDropdown } from '@/src/components/buttons/ButtonDropdown'
import { Dropdown as BaseDropdown, DropdownItem } from '@/src/components/dropdown'
import { StatusColors } from '@/src/pagePartials/bridgeExplorer/common/StatusColors'
import { TransactionStatus } from '@/types/generated/subgraph'

const Dropdown = styled(BaseDropdown)`
  .dropdownItems {
    min-width: fit-content;
    width: 100%;
  }
`

const Button = styled(ButtonDropdown)<{ $activeFilter: boolean }>`
  ${({ $activeFilter }) =>
    $activeFilter &&
    css`
      background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColorHover};
      border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColorHover};
      color: ${({ theme: { buttonDropdown } }) => buttonDropdown.colorHover};
    `}
`

const LittleCircleOfExtraClarification = styled.div<{ $status: TransactionStatus }>`
  --size: 8px;

  background-color: ${({ $status }) => StatusColors[$status] ?? StatusColors.DEFAULT};
  align-items: center;
  border-radius: 50%;
  height: var(--size);
  width: var(--size);
`

interface Props {
  onChange: (bridge: string) => void
  value: string
  options: string[]
}

export const FilterDropdown: React.FC<Props> = ({ onChange, options, value, ...restProps }) => {
  return (
    <Dropdown
      activeItemHighlight
      activeItemIndex={options.indexOf(value)}
      dropdownButton={<Button $activeFilter={options[0] !== value}>{value}</Button>}
      items={options.map((el, index) => (
        <DropdownItem key={index} onClick={() => onChange(el)}>
          {index !== 0 &&
            Object.values(TransactionStatus)?.includes(el.toUpperCase() as TransactionStatus) && (
              <LittleCircleOfExtraClarification $status={el.toUpperCase() as TransactionStatus} />
            )}
          {el}
        </DropdownItem>
      ))}
      {...restProps}
    />
  )
}
