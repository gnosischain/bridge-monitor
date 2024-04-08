import styled from 'styled-components'

import { Warning } from '@/src/components/assets/Warning'
import React from 'react'

const Contents = styled.div`
  display: flex;
  gap: calc(var(--theme-common-space) * 2);
  min-height: 80px;

  .warning {
    color: ${({ theme: { colors } }) => colors.warning};
  }
`

const Text = styled.span`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.6rem;
  line-height: 1.4;
`

export const NotBridgetERC20Warning: React.FC = () => {
  return (
    <>
      <Contents>
        <Warning />
        <Text>This token currently is not supported on the Gnosis Bridge</Text>
      </Contents>
    </>
  )
}
