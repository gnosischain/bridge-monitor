import styled, { css } from 'styled-components'

import { TokenAddress } from '@/src/components/token/TokenAddress'
import { TransactionDate } from '@/src/pagePartials/bridgeExplorer/transaction/TransactionDate'
import { getTxScanUrl } from '@/src/utils/transactions'
import { IconLink } from '@/src/components/assets/IconLink'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream_50};
  border-radius: 8px;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  flex-wrap: wrap;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    column-gap: calc(var(--theme-common-space) * 2);
  }

  &:nth-child(even) {
    background: transparent;
  }
`

const CommonCSS = css`
  flex: 1 1 0;
  min-width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    min-width: 50%;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    min-width: 0;
  }
`

const Title = styled.h4`
  ${CommonCSS}

  align-items: center;
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: flex;
  font-weight: 500;
  margin: 0;
`

const Address = styled(TokenAddress)`
  ${CommonCSS}
`

const Date = styled(TransactionDate)`
  ${CommonCSS}
`

const Link = styled.a`
  ${CommonCSS}

  align-items: center;
  color: ${({ theme: { colors } }) => colors.success};
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.4rem;
  line-height: 1.5;
  text-decoration: none;

  &:hover {
    color: ${({ theme: { colors } }) => colors.primary};
  }

  svg {
    margin-top: -2px;
  }
`

interface Props {
  icon?: React.ReactNode
  network: string
  title: string
  transaction: { transactionHash: string; timestamp: number }
}

export const DetailsRow: React.FC<Props> = ({ icon, network, title, transaction }) => {
  return (
    <Wrapper>
      <Title>
        {icon}
        {title}
      </Title>
      <Address address={transaction.transactionHash} copy />
      <Date completed={transaction.timestamp} />
      <Link
        href={getTxScanUrl(transaction.transactionHash, network)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span>Transaction details</span>
        <IconLink />
      </Link>
    </Wrapper>
  )
}
