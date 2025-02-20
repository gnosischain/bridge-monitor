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

const ExternalLink = styled.a`
  color: ${({ theme: { colors } }) => colors.textColor};
`

export const UnwrapFirst: React.FC<{ symbol: string | undefined }> = ({ symbol }) => {
  const bridgeLink = `https://swap.cow.fi/#/100/swap/${symbol}/xDAI`
  return (
    <>
      <Contents>
        <Warning />
        <Text>
          <b>wxDAI</b> and <b>sDAI</b> need to be unwrapped to xDAI first before bridging to
          Ethereum.
          <br /> You can swap your tokens to xDAI on CoW Swap:{' '}
          <ExternalLink href={bridgeLink} rel="noreferrer" target="_blank">
            {bridgeLink}
          </ExternalLink>{' '}
        </Text>
      </Contents>
    </>
  )
}
