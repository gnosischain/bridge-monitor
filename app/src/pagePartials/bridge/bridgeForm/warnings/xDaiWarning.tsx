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

export const XdaiWarning: React.FC = () => {
  return (
    <Contents>
      <Warning />
      <Text>
        We are currently working on resolving the UI issues.
        <br />
        Thank you for your patience. In the meantime, you can still interact directly with the smart
        contract to relay DAI and xDAI via the xDAI Bridge. For the contract address, please refer
        to{' '}
        <Link
          href={
            'https://docs.gnosischain.com/bridges/About%20Token%20Bridges/xdai-bridge#key-contracts'
          }
          rel="noreferrer"
          target="_blank"
        >
          documentation
        </Link>{' '}
        page
      </Text>
    </Contents>
  )
}
