import styled from 'styled-components'

import { Address } from '@/src/components/token/Address'
import { IconStatus } from '@/src/components/transaction/IconStatus'
import { TransactionDate } from '@/src/components/transaction/TransactionDate'
import { transformDate } from '@/src/utils/date'

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
  transaction: { timestamp: string; transactionHash: string }[]
}

export const TransactionValidator: React.FC<Props> = ({ status, transaction, validator }) => {
  //the satus is 'not-required' when there are 4 validators that signed
  // @todo:
  let statusMessage = ''
  if (status === 'not-required' && !transaction[0].transactionHash) {
    statusMessage = 'Not required'
    status = 'not-required'
  } else if (!transaction[0].transactionHash) {
    statusMessage = 'Waiting'
    status = 'waiting'
  } else {
    status = 'success'
  }

  const countValidatorSigns = transaction.filter(
    (obj: { transactionHash: string }) => obj.transactionHash,
  ).length

  if (countValidatorSigns > 1) {
    status = 'warning'
  }

  return (
    <Wrapper status={status}>
      <Name>
        <IconStatus status={status} /> {validator}
      </Name>
      <TransactionInfoWrapper>
        {transaction.map(({ timestamp, transactionHash }, index) => (
          <TransactionInfo key={`links_${index}`}>
            <Address address={transactionHash} />
            {transactionHash ? (
              <Info status={status}>
                <TransactionDate completed={transformDate(timestamp)} />
                <a href="/" rel="noopener noreferrer" target="_blank">
                  Transaction details
                </a>
              </Info>
            ) : (
              <>{statusMessage}</>
            )}
          </TransactionInfo>
        ))}
      </TransactionInfoWrapper>
    </Wrapper>
  )
}
