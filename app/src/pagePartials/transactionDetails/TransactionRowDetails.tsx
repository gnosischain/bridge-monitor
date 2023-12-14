import styled from 'styled-components'

import { Address } from '@/src/components/token/Address'
import { TransactionDate } from '@/src/pagePartials/transactionDetails/TransactionDate'
import { getTxScanUrl } from '@/src/utils/transactions'
import { IconLink } from '@/src/components/assets/IconLink'

const Wrapper = styled.li<{ status?: string }>`
  --gap: ${({ theme: { common } }) => common.space}px;

  align-items: center;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ status, theme: { colors } }) =>
    status === 'warning' ? colors.warning : colors.cream};
  display: grid;
  gap: var(--gap);
  grid-template-columns: 1fr;
  list-style: none;
  padding: calc(var(--gap) * 2) var(--gap);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    gap: ${({ theme: { common } }) => common.space * 2}px;
    grid-template-columns: 1fr 3fr;
    padding: var(--gap);
  }

  &:nth-child(odd) {
    background: rgba(255, 255, 255, 0.02);
  }

  p {
    margin: 0;
  }
`

const Title = styled.div`
  align-items: center;
  column-gap: calc(var(--gap) * 1.5);
  display: flex;
`

const TransactionInfoWrapper = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    gap: var(--gap);
    grid-template-columns: 1fr;
  }
`

const TransactionInfo = styled.div`
  display: grid;
  grid-gap: var(--gap);
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 2fr;
    grid-gap: 0 ${({ theme: { common } }) => common.space * 2}px;
  }
`

const Info = styled.div`
  display: grid;
  gap: var(--gap);
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    gap: var(--gap);
    grid-template-columns: 1fr auto;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Link = styled.a<{ status?: string }>`
  align-items: center;
  color: ${({ status, theme: { colors } }) =>
    status === 'warning' ? colors.warning : colors.secondary};
  column-gap: var(--gap);
  display: flex;
  font-size: 1.4rem;
  line-height: 1.5;
  text-decoration: none;

  &:hover {
    color: ${({ theme: { colors } }) => colors.cream};
  }

  svg {
    margin-top: -2px;
  }
`

interface Props {
  icon?: React.ReactNode
  network: string
  status: string
  title: string
  transaction: { transactionHash: string; timestamp: number }
}

export const TransactionRowDetails: React.FC<Props> = ({
  icon,
  network,
  status,
  title,
  transaction,
}) => {
  return (
    <Wrapper status={status}>
      <Title>
        {icon}
        {title}
      </Title>
      <TransactionInfoWrapper>
        <TransactionInfo>
          <Address address={transaction.transactionHash} copy />
          <Info>
            <TransactionDate completed={transaction.timestamp} />
            <Link
              href={getTxScanUrl(transaction.transactionHash, network)}
              rel="noopener noreferrer"
              status={status}
              target="_blank"
            >
              <span>Transaction details</span>
              <IconLink />
            </Link>
          </Info>
        </TransactionInfo>
      </TransactionInfoWrapper>
    </Wrapper>
  )
}
