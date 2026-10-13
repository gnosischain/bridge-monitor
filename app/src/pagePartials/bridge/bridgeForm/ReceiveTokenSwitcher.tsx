import { TokenSelectButton } from '@/src/pagePartials/bridge/bridgeForm/TokenSelectButton'
import styled from 'styled-components'

// A small segmented control: the picked token sits on a white chip.
const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.lilac};
  border-radius: 999px;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: 2px;
  padding: 3px;
`

interface IOption {
  disabled?: boolean
  icon?: string
  label: string
  name?: string
}

interface Props {
  hasFullWidth?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  options: IOption[]
  optionsId: string
  value: string
}

export const ReceiveTokenSwitcher = ({
  onChange,
  options,
  optionsId,
  value,
  ...restProps
}: Props) => {
  return (
    <Wrapper {...restProps}>
      {options.map(({ disabled, icon, label }) => (
        <TokenSelectButton
          checked={value === label}
          disabled={disabled}
          icon={icon}
          id={`${optionsId}-${label}`}
          key={label}
          label={label}
          name={optionsId}
          onChange={onChange}
          value={label}
        />
      ))}
    </Wrapper>
  )
}
