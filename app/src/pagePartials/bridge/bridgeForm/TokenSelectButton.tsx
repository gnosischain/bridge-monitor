import { TokenIcon } from '@/src/components/token/TokenIcon'
import React, { InputHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const Input = styled.input`
  cursor: pointer;
  opacity: 0;
  position: absolute;
`

const Checkmark = styled.span`
  align-items: center;
  border-radius: 999px;
  color: ${({ theme: { colors } }) => colors.fog};
  display: flex;
  gap: 6px;
  height: 34px;
  padding: 0 12px 0 5px;
  transition: background-color 0.15s linear;
`

const Wrapper = styled.label<{ disabled?: boolean }>`
  cursor: pointer;
  display: flex;
  font-size: 1.5rem;
  font-weight: 600;
  user-select: none;

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    `}

  &:hover ${Input} ~ ${Checkmark} {
    color: ${({ theme: { colors } }) => colors.ink};
  }

  ${Input}:checked ~ ${Checkmark} {
    background-color: ${({ theme: { colors } }) => colors.surface};
    box-shadow: 0 1px 2px rgba(7, 5, 44, 0.12);
    color: ${({ theme: { colors } }) => colors.ink};
    cursor: default;
  }

  ${Input}:focus-visible ~ ${Checkmark} {
    outline: 2px solid ${({ theme: { colors } }) => colors.violet};
    outline-offset: 1px;
  }
`

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean
  error?: boolean
  icon?: string
  id: string
  label: string
}

export const TokenSelectButton: React.FC<Props> = ({
  disabled,
  icon,
  id,
  label,
  name,
  ...restProps
}) => {
  return (
    <Wrapper disabled={disabled}>
      <Input id={id} name={name} type="radio" {...restProps} />
      <Checkmark>
        <TokenIcon dimensions={24} iconSource={icon} symbol={label} />
        {label}
      </Checkmark>
    </Wrapper>
  )
}
