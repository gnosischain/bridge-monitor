import styled from 'styled-components'

import { Badge } from '@/src/pagePartials/bridgeExplorer/transaction/Badge'
import { InnerCard } from '@/src/components/card/InnerCard'
import { TransactionStatus } from '@/src/pagePartials/bridgeExplorer/common/TransactionStatus'
import { Transaction } from '@/src/utils/transactions'

const Wrapper = styled(InnerCard)`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  flex: 1 1 0;
  justify-content: space-between;
  row-gap: calc(var(--theme-common-space) * 2);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    row-gap: calc(var(--theme-common-space) * 3);
  }
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
  children?: React.ReactNode
  subTitle?: string
  title: string
  transaction?: Transaction
}

export const Pod: React.FC<Props> = ({ children, subTitle, title, transaction, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Header>
        <Badge text={title} />
        {transaction ? (
          <Status status={transaction.transactionStatus} />
        ) : subTitle ? (
          <Badge text={subTitle} />
        ) : null}
      </Header>
      <>{children}</>
    </Wrapper>
  )
}
