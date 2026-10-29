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

const Link = styled.a`
  color: ${({ theme: { colors } }) => colors.ink};
  font-weight: 500;
  word-break: break-all;
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
        This operation will swap <b>USDC.e</b> to <b>USDC</b> on Gnosis chain and bridge it to{' '}
        <b>USDC</b> on Ethereum
      </Text>
    </Contents>
  )
}
