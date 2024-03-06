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

const Value = styled.span<{ disabled?: boolean }>`
  font-size: 1.5rem;
  font-weight: 500;
  margin-left: auto;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
    font-weight: 600;
  }
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
}

export const ReceiveNativeTokenSwitcher = ({
  onChange,
  options,
  optionsId,
  ...restProps
}: Props) => {
  return (
    <Wrapper {...restProps}>
      {options.map(({ disabled, icon, label, name }, index) => (
        <TokenSelectButton
          defaultChecked={index === 0}
          disabled={disabled}
          icon={icon}
          id={optionsId}
          key={index}
          label={label}
          name={name}
          onChange={onChange}
          value={label}
        />
      ))}
    </Wrapper>
  )
}
