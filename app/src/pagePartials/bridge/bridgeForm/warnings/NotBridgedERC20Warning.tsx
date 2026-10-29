import styled from 'styled-components'

import { Warning } from '@/src/components/assets/Warning'
import React from 'react'

const Contents = styled.div`
  align-items: flex-start;
  background-color: ${({ theme: { colors } }) => colors.warningSoft};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  display: flex;
  gap: calc(var(--theme-common-space) * 1.5);
  padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);

  .warning {
    color: ${({ theme: { colors } }) => colors.warning};
    height: 20px;
    margin-top: 1px;
    width: 20px;
  }
`

const Text = styled.span`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.4rem;
  line-height: 1.5;
  min-width: 0;
`

export const NotBridgedERC20Warning: React.FC = () => {
  return (
    <>
      <Contents>
        <Warning />
        <Text>This token currently is not supported on the Gnosis Bridge</Text>
      </Contents>
    </>
  )
}
