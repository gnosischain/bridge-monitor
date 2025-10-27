import { TokenSelectButton } from '@/src/pagePartials/bridge/bridgeForm/TokenSelectButton'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: calc(var(--theme-common-space) * 2);
  height: 100%;
  justify-content: flex-start;
  width: 100%;
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
