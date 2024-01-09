import styled from 'styled-components'

import { Badge } from '@/src/pagePartials/bridgeExplorer/transaction/Badge'
import { InnerCard } from '@/src/components/card/InnerCard'
import { TransactionStatus } from '@/src/pagePartials/bridgeExplorer/common/TransactionStatus'
import { Transaction } from '@/src/utils/transactions'
import { UpdateInMemoryTx } from '@/src/hooks/subgraph/useTransactions'

const Wrapper = styled(InnerCard)`
  border-radius: 8px;
  flex: 1 1 0;
  justify-content: space-between;
  row-gap: calc(var(--theme-common-space) * 3);

  > div {
    min-height: 24px;
  }
`
const Header = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: calc(var(--theme-common-space) / 2);
`

const Status = styled(TransactionStatus)`
  margin-left: auto;
`

interface Props {
  subTitle?: string
  title: string
  transaction?: Transaction
  updateInMemoryTransaction?: UpdateInMemoryTx
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
    <Wrapper {...restProps}>
      <Header>
        <Badge text={title} />
        {transaction && updateInMemoryTransaction ? (
          <Status status={transaction.transactionStatus} />
        ) : subTitle ? (
          <Badge text={subTitle} />
        ) : null}
      </Header>
      <>{children}</>
    </Wrapper>
  )
}
