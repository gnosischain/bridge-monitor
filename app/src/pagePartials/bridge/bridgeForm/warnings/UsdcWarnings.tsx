import styled from 'styled-components'
import { Warning } from '@/src/components/assets/Warning'
import React from 'react'

const Contents = styled.div`
  display: flex;
  align-items: center;
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

const Link = styled.a`
  color: ${({ theme: { colors } }) => colors.textColor};
`

export const UsdcEthWarning: React.FC = () => {
  return (
    <Contents>
      <Warning />
      <Text>
        By bridging <b>USDC</b> from Ethereum, you will get <b>USDC.e</b> by default.
        <br />
        If you want to get <b>old USDC (USDC on xDAI)</b>, please swap your <b>USDC.e</b> after
        bridging to Gnosis Chain on the{' '}
        <Link href={'/usdc'} rel="noreferrer" target="_blank">
          USDC swap
        </Link>{' '}
        page
      </Text>
    </Contents>
  )
}

export const UsdcEGcWarning: React.FC = () => {
  return (
    <Contents>
      <Warning />
      <Text>
        Please convert <b>USDC.e</b> to <b>USDC</b> before bridging on the{' '}
        <Link href={'/usdc'} rel="noreferrer" target="_blank">
          <b>USDC swap</b>
        </Link>{' '}
        page
      </Text>
    </Contents>
  )
}
