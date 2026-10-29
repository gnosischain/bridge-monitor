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

const ExternalLink = styled.a`
  color: ${({ theme: { colors } }) => colors.ink};
  font-weight: 500;
  word-break: break-all;
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
