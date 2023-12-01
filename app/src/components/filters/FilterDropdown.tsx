import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { ButtonDropdown } from '@/src/components/buttons/ButtonDropdown'
import { Dropdown as BaseDropdown, DropdownItem } from '@/src/components/common/Dropdown'
import { StatusColors } from '@/src/components/helpers/StatusColors'
import { TransactionStatus } from '@/types/generated/subgraph'

const Dropdown = styled(BaseDropdown)`
  .dropdownItems {
    min-width: fit-content;
    width: 100%;
  }
`

const Button = styled(ButtonDropdown)<{ activeFilter: boolean }>`
  ${({ activeFilter }) =>
    activeFilter &&
    css`
      background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColorHover};
      border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColorHover};
      color: ${({ theme: { buttonDropdown } }) => buttonDropdown.colorHover};
    `}
`

const LittleCircleOfExtraClarification = styled.div<{ status: TransactionStatus }>`
  --size: 8px;

  background-color: ${(props) => StatusColors[props.status] ?? StatusColors.DEFAULT};
  align-items: center;
  border-radius: 50%;
  height: var(--size);
  width: var(--size);
`

interface Props {
  onChange?: (bridge: string) => void
  onEnterValue?: () => void
  options: string[]
  reset?: boolean
}

export const FilterDropdown: React.FC<Props> = ({
  onChange,
  onEnterValue,
  options,
  reset,
  ...restProps
}) => {
  const [selectedOption, setSelectedOption] = useState<string>()

  const onSelectOption = (bridgeFilter: string) => {
    setSelectedOption(bridgeFilter)
    if (typeof onChange !== 'undefined') {
      onChange(bridgeFilter)
      if (onEnterValue) onEnterValue()
    }
  }

  useMemo(() => {
    if (reset) {
      setSelectedOption(options[0])
    }
  }, [options, reset])

  return (
    <Dropdown
      activeItemHighlight
      dropdownButton={
        <Button activeFilter={options[0] !== selectedOption}>
          {selectedOption ? selectedOption : options[0]}
        </Button>
      }
      items={options.map((el, index) => (
        <DropdownItem
          key={index}
          onClick={() => {
            onSelectOption(el)
          }}
        >
          {index !== 0 &&
            Object.values(TransactionStatus)?.includes(el.toUpperCase() as TransactionStatus) && (
              <LittleCircleOfExtraClarification status={el.toUpperCase() as TransactionStatus} />
            )}
          {el}
        </DropdownItem>
      ))}
      {...restProps}
    />
  )
}
