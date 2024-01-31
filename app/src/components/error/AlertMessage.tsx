import React from 'react'
import styled from 'styled-components'

import { Warning } from '@/src/components/assets/Warning'

const Wrapper = styled.div`
  align-items: center;
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme: { colors } }) => colors.error};
  gap: calc(var(--theme-common-space) * 2);
  display: flex;
  font-size: 1.6rem;
  line-height: 1.2;
  padding: calc(var(--theme-common-space) * 3);
  width: 100%;
  span {
    color: ${({ theme: { colors } }) => colors.error};
  }
`

export const AlertMessage: React.FC<{
  text?: string | React.ReactNode
  icon?: React.ReactNode
}> = ({ icon = <Warning />, text = 'Something went wrong.', ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <span>{icon}</span>
      {text}
    </Wrapper>
  )
}
