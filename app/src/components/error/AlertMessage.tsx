import React from 'react'
import styled from 'styled-components'

import { Warning } from '@/src/components/assets/Warning'

const Wrapper = styled.div<{ mode?: 'error' | 'warning' }>`
  align-items: center;
  background-color: ${({ mode, theme: { colors } }) =>
    mode === 'warning' ? colors.warningSoft : colors.errorSoft};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ mode, theme: { colors } }) => (mode === 'warning' ? colors.warning : colors.error)};
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.45;
  gap: calc(var(--theme-common-space) * 1.5);
  padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);
  width: 100%;

  svg {
    flex-shrink: 0;
    height: 20px;
    width: 20px;
  }
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
  mode?: 'error' | 'warning'
  text?: string | React.ReactNode
}> = ({ icon = <Warning />, mode, text = 'Something went wrong.', ...restProps }) => {
  return (
    <Wrapper mode={mode} {...restProps}>
      {icon}
      <Text>{text}</Text>
    </Wrapper>
  )
}
