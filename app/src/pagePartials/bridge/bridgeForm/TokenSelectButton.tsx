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
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  display: flex;
  flex: 1;
  gap: var(--theme-common-space);
  justify-content: flex-start;
  max-width: fit-content;
  min-width: 100px;
  opacity: 0.6;
  padding: 0 var(--theme-common-space);
`

const Wrapper = styled.label<{ disabled?: boolean }>`
  cursor: pointer;
  display: flex;
  font-size: 1.6rem;
  height: 100%;
  margin-left: calc(var(--theme-common-space) * -1);
  user-select: none;

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    `}

  &:hover ${Input} ~ ${Checkmark} {
    opacity: 1;
  }

  ${Input}:checked ~ ${Checkmark} {
    opacity: 1;
    cursor: default;
  }
`

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean
  error?: boolean
  icon?: string
  id: string
  label: string
}

export const TokenSelectButton: React.FC<Props> = ({ disabled, icon, id, label, ...restProps }) => {
  return (
    <Wrapper disabled={disabled}>
      <Input id={id} name="radio" type="radio" {...restProps} />
      <Checkmark>
        <TokenIcon dimensions={24} iconSource={icon} symbol={label} />
        {label}
      </Checkmark>
    </Wrapper>
  )
}
