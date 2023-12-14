import styled from 'styled-components'

import { Badge } from '@/src/components/common/Badge'
import { InnerCard } from '@/src/components/common/InnerCard'
import { TransactionStatusTypes } from '@/src/constants/types'
import { ClaimButton } from '@/src/pagePartials/latestTransactions/ClaimButton'
import { Status } from '@/src/components/common/Status'
import { TransactionStatus } from '@/types/generated/subgraph'
import { Transaction } from '@/src/utils/transactions'

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
  flex: 1 1 0;
  justify-content: space-between;
  padding-bottom: ${({ theme: { common } }) => common.space * 3}px;
  padding-top: ${({ theme: { common } }) => common.space * 3}px;

  > div {
    min-height: 24px;
  }
`
const Header = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: ${({ theme: { common } }) => common.space / 2}px;
`

const Claim = styled(ClaimButton)`
  margin-left: auto;
`

const TxStatus = styled(Status)`
  margin-left: auto;
`

interface Props {
  transaction?: Transaction
  subTitle?: string
  title: string
  updateInMemoryTransaction?: (transaction: Transaction) => void
}

export const Pod: React.FC<Props> = ({
  children,
  subTitle,
  title,
  transaction,
  updateInMemoryTransaction,
  ...restProps
}) => {
  return (
    <Wrapper status={transaction?.transactionStatus} {...restProps}>
      <Header>
        <Badge text={title} />
        {transaction && updateInMemoryTransaction ? (
          transaction.transactionStatus === TransactionStatus.Unclaimed ? (
            <Claim
              transaction={transaction}
              updateInMemoryTransaction={updateInMemoryTransaction}
            />
          ) : (
            <TxStatus status={transaction.transactionStatus} />
          )
        ) : subTitle ? (
          <Badge text={subTitle} />
        ) : null}
      </Header>
      <>{children}</>
    </Wrapper>
  )
}
