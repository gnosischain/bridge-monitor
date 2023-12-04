import { TransactionStatus } from '@/types/generated/subgraph'
import styled, { css } from 'styled-components'

import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { Pod } from '@/src/components/common/Pod'
import { TransactionDate } from '@/src/pagePartials/transaction/TransactionDate'
import { getAddressScanUrl } from '@/src/utils/transactions'
import { Address } from '@/src/components/token/Address'
import {
  Initiator as BaseInitiator,
  Receiver as BaseReceiver,
} from '@/src/components/token/TokenWithValue'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { Transaction } from '@/src/utils/transactions'
import { ArrowUp } from '@/src/components/assets/ArrowUp'

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
    grid-template-columns: 0.85fr 0.85fr 0.85fr 1.225fr 1.225fr;
  }
`

const PodAmount = styled(Pod)`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-column: auto / span 2;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-column: auto / span 1;
  }
`

const PodStatus = styled(Pod)`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-column: auto / span 1;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-column: auto / span 1;
  }
`

const CommonCSS = css`
  min-width: 0;

  .label {
    display: none;
  }

  .value {
    font-size: inherit;
    line-height: inherit;
  }
`

const AmountRow = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space * 3}px;
  display: flex;
`

const Initiator = styled(BaseInitiator)`
  ${CommonCSS}
`

const Receiver = styled(BaseReceiver)`
  ${CommonCSS}
`

const ArrowRight = styled(ArrowUp)`
  display: block;
  transform: rotate(-90deg);
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
      <Pod subTitle={bridgeName === 'AMB' ? 'Omnibridge' : bridgeName} title="Bridge">
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
      <PodAmount title="Amount">
        <AmountRow>
          <Initiator
            bridgeName={bridgeName}
            initiatorNetwork={initiatorNetwork}
            token={initiatorToken}
            tokenValue={initiatorAmount}
          />
          {bridgeName.toLowerCase() === 'xdai' && <ArrowRight />}
          <Receiver
            bridgeName={bridgeName}
            initiatorNetwork={initiatorNetwork}
            token={initiatorToken}
            tokenValue={initiatorAmount}
          />
        </AmountRow>
      </PodAmount>
      {/* @todo - If a signature fails it has to change state */}
      <PodStatus
        subTitle={transactionStatus}
        title="Status"
        transaction={transaction}
        updateInMemoryTransaction={updateInMemoryTransaction}
      >
        {/* @todo:
         - if transactionStatus is not completed, completed value must be empty
        */}
        <TransactionDate completed={timestampExecution} started={timestampStarted} />
      </PodStatus>
    </Wrapper>
  )
}

export const TransactionSummaryPlaceholder: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {Array.from({ length: 5 }).map((item, index) => (
        <SkeletonLoading key={index} style={{ borderRadius: '4px', height: '112px' }} />
      ))}
    </Wrapper>
  )
}
