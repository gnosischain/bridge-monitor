import { TransactionStatus } from '@/types/generated/subgraph'
import styled from 'styled-components'

import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { Pod } from '@/src/components/common/Pod'
import { TransactionDate } from '@/src/components/transaction/TransactionDate'
import { getAddressScanUrl } from '@/src/utils/transactions'
import { Address } from '@/src/components/token/Address'
import { TokenWithValue } from '@/src/components/token/TokenWithValue'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { Transaction } from '@/src/utils/transactions'

const Wrapper = styled.div`
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: flex;
    flex-direction: row;
  }
`

const Value = styled(TokenWithValue)`
  .label {
    display: none;
  }

  .value {
    font-size: inherit;
    line-height: inherit;
  }
`

interface Props {
  bridgeName: string
  initiator: string
  initiatorAmount: string
  initiatorName: string
  initiatorNetwork: string
  initiatorNetworkIcon?: string
  initiatorToken: string
  receiver: string
  receiverName: string
  receiverNetwork: string
  receiverNetworkIcon?: string
  timestampExecution: number
  timestampStarted: number
  transaction?: Transaction
  transactionStatus: TransactionStatus
  updateInMemoryTransaction: (transaction: Transaction) => void
}

export const TransactionSummary: React.FC<Props> = ({
  bridgeName,
  initiator,
  initiatorAmount,
  initiatorNetwork,
  initiatorNetworkIcon,
  initiatorToken,
  receiver,
  receiverNetwork,
  receiverNetworkIcon,
  timestampExecution,
  timestampStarted,
  transaction,
  transactionStatus,
  updateInMemoryTransaction,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Pod subTitle={bridgeName} title="Bridge">
        <ChainsInitiatorReceiver
          chainIconInitiator={initiatorNetworkIcon}
          chainIconReceiver={receiverNetworkIcon}
          chainInitiator={initiatorNetwork}
          chainReceiver={receiverNetwork}
          showName
        />
      </Pod>
      <Pod title="Initiator">
        <Address
          address={initiator}
          characters={6}
          copy
          link={getAddressScanUrl(initiator, initiatorNetwork)}
        />
      </Pod>
      <Pod title="Receiver">
        <Address
          address={receiver}
          characters={6}
          copy
          link={getAddressScanUrl(receiver, receiverNetwork)}
        />
      </Pod>
      <Pod title="Amount">
        <Value bridgeName={bridgeName} token={initiatorToken} tokenValue={initiatorAmount} />
      </Pod>
      {/* @todo - If a signature fails it has to change state */}
      <Pod
        subTitle={transactionStatus}
        title="Status"
        transaction={transaction}
        updateInMemoryTransaction={updateInMemoryTransaction}
      >
        {/* @todo:
         - if transactionStatus is not completed, completed value must be empty
        */}
        <TransactionDate completed={timestampExecution} started={timestampStarted} />
      </Pod>
    </Wrapper>
  )
}

export const TransactionSummaryPlaceholder: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {Array.from({ length: 4 }).map((item, index) => (
        <SkeletonLoading key={index} style={{ borderRadius: '4px', height: '112px' }} />
      ))}
    </Wrapper>
  )
}
