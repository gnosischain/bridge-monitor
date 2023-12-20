import styled from 'styled-components'

import { TransactionStatusTypes } from '@/src/constants/types'

const Wrapper = styled.div<{ status?: string }>`
  align-items: center;
  background: ${(props) =>
    props.status === TransactionStatusTypes.waiting ||
    props.status === TransactionStatusTypes.waitingExecution
      ? ({ theme }) => theme.colors.secondary
      : props.status === TransactionStatusTypes.warning
      ? ({ theme }) => theme.colors.warning
      : props.status === TransactionStatusTypes.completed
      ? ({ theme }) => theme.colors.success
      : ({ theme }) => theme.colors.darkerGrey};
  border-radius: 6px;
  color: ${(props) =>
    props.status === TransactionStatusTypes.waiting ||
    props.status === TransactionStatusTypes.waitingExecution ||
    props.status === TransactionStatusTypes.warning ||
    props.status === TransactionStatusTypes.completed
      ? ({ theme }) => theme.colors.darkestGrey
      : ({ theme }) => theme.colors.cream};
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  height: 24px;
  justify-content: center;
  padding: 0 ${({ theme: { common } }) => common.space}px;

  &:first-of-type {
    background: ${({ theme: { colors } }) => colors.darkestGrey};
  }
`

interface Props {
  status?: string
  text: string
}

export const Badge: React.FC<Props> = ({ status, text, ...restProps }) => {
  return (
    <Wrapper status={status} {...restProps}>
      {text}
    </Wrapper>
  )
}
