import styled from 'styled-components'

import { Address } from '@/src/components/token/Address'
import { TransactionDate } from '@/src/pagePartials/transaction/TransactionDate'
import { getTxScanUrl } from '@/src/utils/transactions'
import { IconLink } from '@/src/components/assets/IconLink'

const Wrapper = styled.li<{ status?: string }>`
  --space: ${({ theme: { common } }) => common.space}px;

  align-items: start;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ status, theme: { colors } }) =>
    status === 'warning' ? colors.warning : colors.cream};
  display: grid;
  gap: var(--space);
  grid-template-columns: 1fr;
  list-style: none;
  padding: calc(var(--space) * 2) var(--space);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    gap: ${({ theme: { common } }) => common.space * 2}px;
    grid-template-columns: 1fr 3fr;
    padding: var(--space);
  }

  &:nth-child(odd) {
    background: rgba(255, 255, 255, 0.02);
  }

  p {
    margin: 0;
  }
`

const Name = styled.div`
  align-items: center;
  display: flex;
  gap: var(--space);
`

const TransactionInfoWrapper = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    gap: var(--space);
    grid-template-columns: 1fr;
  }
`

const TransactionInfo = styled.div`
  display: grid;
  grid-gap: var(--space);
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 2fr;
    grid-gap: 0 ${({ theme: { common } }) => common.space * 2}px;
  }
`

const Info = styled.div<{ status?: string }>`
  display: grid;
  grid-gap: 0 var(--space);
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr auto;
    grid-gap: 0 ${({ theme: { common } }) => common.space * 2}px;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Link = styled.a<{ status?: string }>`
  align-items: center;
  color: ${({ status, theme: { colors } }) =>
    status === 'warning' ? colors.warning : colors.secondary};
  column-gap: var(--space);
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
  status: string
  nameValue?: string
  network: string
  transaction: { transactionHash: string; timestamp: number }
}

export const TransactionRowDetails: React.FC<Props> = ({
  nameValue,
  network,
  status,
  transaction,
}) => {
  return (
    <Wrapper status={status}>
      <Name>{nameValue}</Name>
      <TransactionInfoWrapper>
        <TransactionInfo>
          <Address address={transaction.transactionHash} copy />
          <Info status={status}>
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
