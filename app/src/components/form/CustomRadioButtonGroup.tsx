import { CustomRadioButton } from '@/src/components/form/CustomRadioButton'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-direction: row;
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: none;
  padding: var(--theme-common-space);
  gap: calc(var(--theme-common-space) * 2);
  width: 100%;
  height: 54px;
`

interface IOption {
  icon?: string
  label: string
  name?: string
  disabled?: boolean
}
interface Props {
  optionsId: string
  options: IOption[]
  hasFullWidth?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const CustomRadioButtonGroup = ({ onChange, options, optionsId }: Props) => {
  return (
    <Wrapper>
      {options.map(({ disabled, icon, label, name }, index) => (
        <CustomRadioButton
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
