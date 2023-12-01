import styled from 'styled-components'

import { IconStatus as BaseIconStatus } from '@/src/pagePartials/transaction/IconStatus'
import { TransactionDate } from '@/src/pagePartials/transaction/TransactionDate'

const Wrapper = styled.li`
  --line-gap: 24px;
  --status-height: 64px;
  --wrapper-width: 155px;

  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: ${({ theme: { common } }) => common.space * 3}px;
  position: relative;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    column-gap: 50px;
    grid-template-columns: var(--wrapper-width) minmax(0, 950px);
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    &::after {
      background-color: ${({ theme: { colors } }) => colors.darkGrey};
      border-radius: 8px;
      content: '';
      height: calc(100% - var(--line-gap) - var(--status-height));
      left: calc(var(--wrapper-width) / 2);
      position: absolute;
      top: calc(var(--status-height) + var(--line-gap));
      width: 4px;
    }

    &:last-child::after {
      display: none;
    }
  }

  ul {
    padding: 0;
  }
`

const Status = styled.div<{ inactive?: boolean; status: string }>`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  border-radius: 8px;
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
  height: var(--status-height);
  padding: 0 ${({ theme: { common } }) => common.space}px;
`

const IconStatus = styled(BaseIconStatus)`
  --size: 28px;

  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  height: var(--size);
  width: var(--size);
`

const StatusText = styled.div`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.2;
`

const Content = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: ${({ theme: { common } }) => common.space * 4}px;
`

const Title = styled.h3`
  color: #fff;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin: ${({ theme: { common } }) => common.space / 2}px 0 0;
`

const Text = styled.p`
  color: #fff;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0 0 ${({ theme: { common } }) => common.space * 3}px;
  white-space: pre-wrap;
  word-break: break-word;

  &:last-child {
    margin-bottom: 0;
  }
`

interface Props {
  dateCompleted?: number
  description: string
  title: string
  transactionStatus: string
  waiting?: boolean
}

export const TransactionDetailsListItem: React.FC<Props> = ({
  children,
  dateCompleted,
  description,
  title,
  transactionStatus,
  waiting,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Status inactive={waiting} status={transactionStatus}>
        <IconStatus status={transactionStatus} />
        <StatusText>{transactionStatus}</StatusText>
      </Status>
      <Content>
        <Title>{title}</Title>
        <Text>{description}</Text>
        {dateCompleted && <TransactionDate completed={dateCompleted} />}
        {children}
      </Content>
    </Wrapper>
  )
}
