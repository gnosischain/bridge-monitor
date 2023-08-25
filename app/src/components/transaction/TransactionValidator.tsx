import styled from 'styled-components'

import { Address } from '@/src/components/token/Address'
import { IconStatus } from '@/src/components/transaction/IconStatus'
import { TransactionDate } from '@/src/components/transaction/TransactionDate'
import { TransactionExecution, TransactionValidation } from '@/src/utils/transactions'

const Wrapper = styled.li<{ status?: string }>`
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme: { common } }) => common.space}px;
  padding: ${({ theme: { common } }) => common.space * 2}px
    ${({ theme: { common } }) => common.space}px;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${(props) =>
    props.status === 'warning'
      ? ({ theme }) => theme.colors.warning
      : ({ theme }) => theme.colors.cream};
  opacity: ${(props) => (props.status === 'waiting' || props.status === 'not-required' ? 0.4 : 1)};
  align-items: start;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    gap: ${({ theme: { common } }) => common.space * 2}px;
    grid-template-columns: 1fr 3fr;
    padding: ${({ theme: { common } }) => common.space}px;
  }
  &:nth-child(odd) {
    background: rgba(255, 255, 255, 0.02);
  }
  p {
    margin: 0;
  }
`

const Name = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme: { common } }) => common.space}px;
`

const TransactionInfoWrapper = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    gap: ${({ theme: { common } }) => common.space}px;
    grid-template-columns: 1fr;
  }
`

const TransactionInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: ${({ theme: { common } }) => common.space}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 2fr;
    grid-gap: 0 ${({ theme: { common } }) => common.space * 2}px;
  }
`
const Info = styled.div<{ status?: string }>`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 0 ${({ theme: { common } }) => common.space}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr auto;
    grid-gap: 0 ${({ theme: { common } }) => common.space * 2}px;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
  a {
    text-decoration: none;
    font-size: 1.4rem;
    line-height: 24px;
    color: ${(props) =>
      props.status === 'warning'
        ? ({ theme }) => theme.colors.warning
        : ({ theme }) => theme.colors.secondary};
    &:hover {
      color: ${({ theme: { colors } }) => colors.cream};
    }
  }
`

interface Props {
  status: string
  validator: string
  transaction: TransactionValidation | TransactionExecution
}

export const TransactionValidator: React.FC<Props> = ({ status, transaction, validator }) => {
  const statusMessage = 'VALIDATOR STATUS MESSAGE'
  function getValidationURL(transactionHash: string): string | undefined {
    const baseURL = 'https://gnosisscan.io/'
    return `${baseURL}tx/${transactionHash}`
  }

  return (
    <Wrapper status={status}>
      <Name>
        <IconStatus status={status} /> {validator}
      </Name>
      <TransactionInfoWrapper>
        <TransactionInfo>
          <Address address={transaction.transactionHash} />
          {transaction ? (
            <Info status={status}>
              <TransactionDate completed={transaction.timestamp} />
              <a
                href={getValidationURL(transaction.transactionHash)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Transaction details
              </a>
            </Info>
          ) : (
            <>{statusMessage}</>
          )}
        </TransactionInfo>
      </TransactionInfoWrapper>
    </Wrapper>
  )
}
