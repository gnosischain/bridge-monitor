import styled from 'styled-components'
import { TransactionStatus } from '@/src/pagePartials/bridgeExplorer/common/TransactionStatus'
import { ClaimButton } from '@/src/pagePartials/bridgeExplorer/latestTransactions/ClaimButton'
import { Transaction } from '@/src/utils/transactions'
import { TransactionStatus as TxStatusEnum } from '@/src/utils/transactions'
import { IconClock } from '@/src/components/assets/IconClock'
import { Tooltip } from '@/src/components/tooltip'
import { txTime } from '@/src/utils/txTime'
import { ClaimActions } from '@/src/hooks/useTransactions'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  flex-direction: row;
`

const Network = styled.span`
  text-transform: capitalize;
`

const Emphasize = styled.span`
  font-weight: 600;
`

type Props = {
  transaction: Transaction
  claimActions: ClaimActions
}

export const StatusCell: React.FC<Props> = ({ claimActions, transaction }) => {
  const { initiatorNetwork, receiverNetwork, transactionStatus } = transaction

  return transactionStatus === TxStatusEnum.Unclaimed ? (
    <ClaimButton claimActions={claimActions} transactions={[transaction]} />
  ) : (
    <Wrapper>
      {transactionStatus === 'INITIATED' && (
        <Tooltip
          content={
            <>
              Transactions from <Network>{initiatorNetwork}</Network> to{' '}
              <Network>{receiverNetwork}</Network> usually take ~
              <Emphasize>{txTime(initiatorNetwork)}</Emphasize>
            </>
          }
        >
          <IconClock />
        </Tooltip>
      )}
      <TransactionStatus status={transactionStatus} />
    </Wrapper>
  )
}
