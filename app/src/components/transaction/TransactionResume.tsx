import styled from 'styled-components'

import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { InitiatorReceiver } from '@/src/components/common/InitiatorReceiver'
import { Pod } from '@/src/components/common/Pod'
import { TransactionDate } from '@/src/components/transaction/TransactionDate'
import { getAddressScanUrl } from '@/src/utils/transactions'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;

    div:nth-child(3) {
      grid-column: 1 / 2;
      grid-row: 2 / 3;
    }

    div:nth-child(2) {
      grid-column: 2 / 2;
      grid-row: 2 / 3;
    }
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    grid-template-columns: 215px 2fr 2fr 1fr;

    div:nth-child(3) {
      grid-column: unset;
      grid-row: unset;
    }

    div:nth-child(2) {
      grid-column: unset;
      grid-row: unset;
    }
  }
`

interface Props {
  bridgeName: string
  initiator: string
  initiatorAmount: string
  initiatorName: string
  initiatorNetwork: string
  initiatorNetworkIcon: string
  initiatorTokenIcon: string
  initiatorTokenName: string
  receiver: string
  receiverAmount: string
  receiverName: string
  receiverNetwork: string
  receiverNetworkIcon: string
  receiverTokenIcon: string
  receiverTokenName: string
  transactionStatus: string
  timestampExecution: number
  timestampStarted: number
}

export const TransactionResume: React.FC<Props> = ({
  bridgeName,
  initiator,
  initiatorAmount,
  initiatorNetwork,
  initiatorNetworkIcon,
  initiatorTokenIcon,
  initiatorTokenName,
  receiver,
  receiverAmount,
  receiverNetwork,
  receiverNetworkIcon,
  receiverTokenIcon,
  receiverTokenName,
  timestampExecution,
  timestampStarted,
  transactionStatus,
}) => {
  return (
    <Wrapper>
      <Pod badgeSubTitleText={bridgeName} badgeTitleText="Bridge">
        {/* @todo */}
        <ChainsInitiatorReceiver
          chainIconInitiator={initiatorNetworkIcon ?? ''}
          chainIconReceiver={receiverNetworkIcon ?? ''}
          chainInitiator={initiatorNetwork}
          chainReceiver={receiverNetwork}
          showName
        />
      </Pod>
      <Pod badgeTitleText="Initiator">
        <InitiatorReceiver
          address={initiator}
          bigNumber
          inline
          scanLink={getAddressScanUrl(initiator, initiatorNetwork)}
          token={initiatorTokenName}
          tokenIcon={initiatorTokenIcon}
          tokenValue={initiatorAmount}
        />
      </Pod>
      <Pod badgeTitleText="Receiver">
        <InitiatorReceiver
          address={receiver}
          bigNumber
          inline
          scanLink={getAddressScanUrl(receiver, receiverNetwork)}
          token={receiverTokenName}
          tokenIcon={receiverTokenIcon}
          tokenValue={receiverAmount}
        />
      </Pod>
      {/* @todo - If a signature fails it has to change state */}
      <Pod badgeSubTitleText={transactionStatus} badgeTitleText="Status" status={transactionStatus}>
        {/* @todo:
         - if transactionStatus is not completed, completed value must be empty
        */}
        <TransactionDate completed={timestampExecution} started={timestampStarted} />
      </Pod>
    </Wrapper>
  )
}
