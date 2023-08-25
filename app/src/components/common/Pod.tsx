import styled from 'styled-components'

import { Badge } from '@/src/components/common/Badge'
import { InnerCard } from '@/src/components/common/InnerCard'
import { TransactionStatusTypes } from '@/src/constants/types'
import { Status } from '@/src/components/common/Status'
import { TransactionStatus } from '@/types/generated/subgraph'

const Wrapper = styled(InnerCard)<{ status?: string }>`
  background: ${(props) =>
    props.status === TransactionStatusTypes.waiting ||
    props.status === TransactionStatusTypes.waitingExecution
      ? ({ theme }) => theme.colors.darkSecondary
      : props.status === TransactionStatusTypes.warning
      ? ({ theme }) => theme.colors.warningDark
      : props.status === TransactionStatusTypes.completed
      ? ({ theme }) => theme.colors.successDark
      : ({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding-bottom: ${({ theme: { common } }) => common.space * 3}px;
  padding-top: ${({ theme: { common } }) => common.space * 3}px;
`
const Header = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: ${({ theme: { common } }) => common.space / 2}px;
`

interface Props {
  subTitle?: string
  title: string
  status?: string
}

export const Pod: React.FC<Props> = ({ children, status, subTitle, title }) => {
  return (
    <Wrapper status={status}>
      <Header>
        <Badge text={title} />
        {status ? (
          <Status status={status as TransactionStatus} />
        ) : subTitle ? (
          <Badge status={status} text={subTitle} />
        ) : null}
      </Header>
      <>{children}</>
    </Wrapper>
  )
}
