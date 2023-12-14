import styled from 'styled-components'
import { Status } from '@/src/components/common/Status'
import { ClaimButton } from '@/src/pagePartials/latestTransactions/ClaimButton'
import { Transaction } from '@/src/utils/transactions'
import { TransactionStatus } from '@/types/generated/subgraph'
import { Warning } from '@/src/components/assets/Warning'
import { StatusColors } from '@/src/components/helpers/StatusColors'
import { Tooltip } from '@/src/components/tooltip/Tooltip'
import { txTime } from '@/src/utils/txTime'

const Wrapper = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space}px;
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
  updateInMemoryTransaction: (transaction: Transaction) => void
}

export const StatusCell: React.FC<Props> = ({ transaction, updateInMemoryTransaction }) => {
  const { initiatorNetwork, receiverNetwork, transactionStatus } = transaction

  return transactionStatus === TransactionStatus.Unclaimed ? (
    <ClaimButton transaction={transaction} updateInMemoryTransaction={updateInMemoryTransaction} />
  ) : (
    <Wrapper>
      {transactionStatus === 'INITIATED' && (
        <Tooltip
          content={
            <>
              Transactions from <Network>{initiatorNetwork}</Network> to{' '}
              <Network>{receiverNetwork}</Network> can take up to{' '}
              <Emphasize>{txTime(initiatorNetwork, receiverNetwork)} minutes</Emphasize>
            </>
          }
        >
          <WarningIcon />
        </Tooltip>
      )}
      <Status status={transactionStatus} />
    </Wrapper>
  )
}
