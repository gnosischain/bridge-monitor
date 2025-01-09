import React from 'react'
import styled from 'styled-components'

import { Warning } from '@/src/components/assets/Warning'

const Wrapper = styled.div<{ mode?: 'error' | 'warning' | 'success' }>`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  color: ${({ mode, theme: { colors } }) =>
    mode === 'error' ? colors.error : mode === 'warning' ? colors.warning : colors.success};
  display: flex;
  font-size: 1.6rem;
  line-height: 1.2;
  gap: calc(var(--theme-common-space) * 2);
  padding: calc(var(--theme-common-space) * 3);
  width: 100%;
`

Wrapper.defaultProps = {
  mode: 'error',
}

const Text = styled.span``

Text.defaultProps = {
  className: 'text',
}

export const AlertMessage: React.FC<{
  icon?: React.ReactNode
  mode?: 'error' | 'warning' | 'success'
  text?: string | React.ReactNode
}> = ({ icon = <Warning />, mode, text = 'Something went wrong.', ...restProps }) => {
  return (
    <Wrapper mode={mode} {...restProps}>
      {icon}
      <Text>{text}</Text>
    </Wrapper>
  )
}
