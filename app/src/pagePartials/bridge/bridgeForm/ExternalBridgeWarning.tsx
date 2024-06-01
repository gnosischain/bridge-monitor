import styled from 'styled-components'
import { Warning } from '@/src/components/assets/Warning'
import React from 'react'
import { Token } from '@/types/token'

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

const ExternalLink = styled.a`
  color: ${({ theme: { colors } }) => colors.textColor};
`

const externalBridges = {
  EURe: 'https://monerium.app/',
  AURA: 'https://app.aura.finance/#/1/bridge',
}

export const ExternalBridgeWarning: React.FC<{ token: Token }> = ({ token }) => {
  const symbol = token.symbol
  const bridgeLink = externalBridges[symbol as keyof typeof externalBridges]

  return (
    <>
      <Contents>
        <Warning />
        <Text>
          <b>{symbol}</b> is not supported on the Gnosis Bridge.
          <br /> Please use{' '}
          <ExternalLink href={bridgeLink} rel="noreferrer" target="_blank">
            {bridgeLink}
          </ExternalLink>{' '}
          for {symbol} cross-chain transfers
        </Text>
      </Contents>
    </>
  )
}
