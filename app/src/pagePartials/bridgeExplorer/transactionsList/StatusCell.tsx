import styled from 'styled-components'
import { TransactionStatus } from '@/src/pagePartials/bridgeExplorer/common/TransactionStatus'
import { ClaimButton } from '@/src/pagePartials/bridgeExplorer/latestTransactions/ClaimButton'
import { Transaction } from '@/src/utils/transactions'
import { TransactionStatus as TxStatusEnum } from '@/src/utils/transactions'
import { Warning } from '@/src/components/assets/Warning'
import { StatusColors } from '@/src/pagePartials/bridgeExplorer/common/StatusColors'
import { Tooltip } from '@/src/components/tooltip'
import { txTime } from '@/src/utils/txTime'
import { UpdateInMemoryTx } from '@/src/hooks/useTransactions'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  flex-direction: row;
`

const WarningIcon = styled(Warning)`
  --size: 18px;

  height: var(--size);
  width: var(--size);

  path {
    fill: ${StatusColors['INITIATED']};
  }
`

const Network = styled.span`
  text-transform: capitalize;
`

const Emphasize = styled.span`
  font-weight: 700;
`

type Props = {
  transaction: Transaction
  updateInMemoryTransaction: UpdateInMemoryTx
}

export const StatusCell: React.FC<Props> = ({ transaction, updateInMemoryTransaction }) => {
  const { initiatorNetwork, receiverNetwork, transactionStatus } = transaction

  return transactionStatus === TxStatusEnum.Unclaimed ? (
    <ClaimButton transaction={transaction} updateInMemoryTransaction={updateInMemoryTransaction} />
  ) : (
    <Wrapper>
      {transactionStatus === 'INITIATED' && (
        <Tooltip
          content={
            <>
              Transactions from <Network>{initiatorNetwork}</Network> to{' '}
              <Network>{receiverNetwork}</Network> can take up to{' '}
              <Emphasize>{txTime(initiatorNetwork)} minutes</Emphasize>
            </>
          }
        >
          <WarningIcon />
        </Tooltip>
      )}
      <TransactionStatus status={transactionStatus} />
    </Wrapper>
  )
}
