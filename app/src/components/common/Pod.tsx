import styled from 'styled-components'

import { Badge } from '@/src/components/common/Badge'
import { InnerCard } from '@/src/components/common/InnerCard'
import { TransactionStatusTypes } from '@/src/constants/types'

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
  badgeSubTitleText?: string
  badgeTitleText: string
  status?: string
}

export const Pod: React.FC<Props> = ({ badgeSubTitleText, badgeTitleText, children, status }) => {
  return (
    <Wrapper status={status}>
      <Header>
        <Badge text={badgeTitleText} />
        {badgeSubTitleText && <Badge status={status} text={badgeSubTitleText} />}
      </Header>
      <>{children}</>
    </Wrapper>
  )
}
