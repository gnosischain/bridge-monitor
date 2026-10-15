import styled from 'styled-components'
import { Warning } from '@/src/components/assets/Warning'
import React from 'react'
import { Token } from '@/types/token'

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

const ExternalLink = styled.a`
  color: ${({ theme: { colors } }) => colors.ink};
  font-weight: 500;
  word-break: break-all;
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
