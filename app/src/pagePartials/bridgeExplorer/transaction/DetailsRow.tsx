import styled, { css } from 'styled-components'

import { TokenAddress } from '@/src/components/token/TokenAddress'
import { TransactionDate } from '@/src/pagePartials/bridgeExplorer/transaction/TransactionDate'
import { getTxScanUrl } from '@/src/utils/transactions'
import { IconLink } from '@/src/components/assets/IconLink'

export const DetailsList = styled.div`
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  display: flex;
  flex-direction: column;

  > * + * {
    border-top: 1px solid ${({ theme: { colors } }) => colors.line};
  }
`

const Wrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  display: flex;
  flex-wrap: wrap;
  font-size: 1.4rem;
  padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);
  row-gap: var(--theme-common-space);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    column-gap: calc(var(--theme-common-space) * 2);
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
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0;
`

const Address = styled(TokenAddress)`
  ${CommonCSS}

  svg {
    color: ${({ theme: { colors } }) => colors.faint};

    &:hover {
      color: ${({ theme: { colors } }) => colors.ink};
    }
  }
`

const Date = styled(TransactionDate)`
  ${CommonCSS}

  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.3rem;
`

const Link = styled.a`
  ${CommonCSS}

  align-items: center;
  color: ${({ theme: { colors } }) => colors.violet};
  column-gap: 6px;
  display: flex;
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    justify-content: flex-end;
  }

  &:hover {
    text-decoration: underline;
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
