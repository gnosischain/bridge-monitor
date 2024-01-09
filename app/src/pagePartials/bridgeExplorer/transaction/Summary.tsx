import { TransactionStatus } from '@/types/generated/subgraph'
import styled, { css } from 'styled-components'

import { ChainsInitiatorReceiver } from '@/src/pagePartials/bridgeExplorer/common/ChainsInitiatorReceiver'
import { Pod } from '@/src/pagePartials/bridgeExplorer/transaction/Pod'
import { TransactionDate } from '@/src/pagePartials/bridgeExplorer/transaction/TransactionDate'
import { getAddressScanUrl } from '@/src/utils/transactions'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import {
  Initiator as BaseInitiator,
  Receiver as BaseReceiver,
} from '@/src/pagePartials/bridgeExplorer/common/TokenWithValue'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { Transaction } from '@/src/utils/transactions'
import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { UpdateInMemoryTx } from '@/src/hooks/subgraph/useTransactions'

const Wrapper = styled.div`
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
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

  .badge {
    background-color: ${({ theme: { colors } }) => colors.darkestGrey};
    color: ${({ theme: { colors } }) => colors.creamLight};
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

const InitiatorReceiver = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 3);
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
  transform: rotate(0deg);
`

const Address = styled(TokenAddress)`
  svg {
    color: ${({ theme: { colors } }) => colors.primary_50};

    &:hover {
      color: ${({ theme: { colors } }) => colors.primary};
    }
  }
`

const Date = styled(TransactionDate)`
  color: ${({ theme: { colors } }) => colors.primary};
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
  updateInMemoryTransaction: UpdateInMemoryTx
}

export const Summary: React.FC<Props> = ({
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
          href={getAddressScanUrl(initiator, initiatorNetwork)}
        />
      </Pod>
      <Pod title="Receiver">
        <Address
          address={receiver}
          characters={6}
          copy
          href={getAddressScanUrl(receiver, receiverNetwork)}
        />
      </Pod>
      <PodAmount title="Amount">
        <InitiatorReceiver>
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
        </InitiatorReceiver>
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
        <Date completed={timestampExecution} started={timestampStarted} />
      </PodStatus>
    </Wrapper>
  )
}

export const SummaryPlaceholder: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {Array.from({ length: 5 }).map((item, index) => (
        <SkeletonLoading key={index} style={{ borderRadius: '4px', height: '112px' }} />
      ))}
    </Wrapper>
  )
}
