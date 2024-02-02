import { TokenIcon } from '@/src/components/token/TokenIcon'
import { InputHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const Container = styled.label<{ disabled?: boolean }>`
  display: flex;
  cursor: pointer;
  font-size: 1.6rem;
  user-select: none;
  flex-grow: 1;

  //height: 38px;
  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    `}
  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkmark {
    border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--theme-common-space);
  }

  &:hover input ~ .checkmark {
    background-color: ${({ theme: { colors } }) => colors.creamLight};
  }

  input:checked ~ .checkmark {
    background-color: ${({ theme: { colors } }) => colors.white};
  }
`
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  label: string
  id: string
  error?: boolean
  disabled?: boolean
}
export const CustomRadioButton = ({ disabled, icon, id, label, ...restProps }: Props) => {
  return (
    <Container disabled={disabled}>
      <input id={id} name="radio" type="radio" {...restProps} />
      <span className="checkmark">
        <TokenIcon dimensions={24} iconSource={icon} symbol={label} />
        {label}
      </span>
    </Container>
  )
}
