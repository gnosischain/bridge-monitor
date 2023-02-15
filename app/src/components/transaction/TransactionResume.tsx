import styled from 'styled-components'

import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { InitiatorReceiver } from '@/src/components/common/InitiatorReceiver'
import { Pod } from '@/src/components/common/Pod'
import { TransactionDate } from '@/src/components/transaction/TransactionDate'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { transformDate } from '@/src/utils/date'
import { formatNumber } from '@/src/utils/formatNumber'

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
  initiatorAmount: number
  initiatorName: string
  initiatorNetwork: string
  initiatorNetworkIcon: string
  initiatorTokenIcon: string
  receiver: string
  receiverAmount: number
  receiverName: string
  receiverNetwork: string
  receiverNetworkIcon: string
  receiverTokenIcon: string
  transactionStatus: string
  timestampExecution: string
  timestampStarted: string
}

export const TransactionResume: React.FC<Props> = ({
  bridgeName,
  initiator,
  initiatorAmount,
  initiatorName,
  initiatorNetwork,
  initiatorNetworkIcon,
  initiatorTokenIcon,
  receiver,
  receiverAmount,
  receiverName,
  receiverNetwork,
  receiverNetworkIcon,
  receiverTokenIcon,
  timestampExecution,
  timestampStarted,
  transactionStatus,
}) => {
  const { getExplorerUrl } = useWeb3Connection()

  return (
    <Wrapper>
      <Pod badgeSubTitleText={bridgeName} badgeTitleText="Bridge">
        {/* @todo */}
        <ChainsInitiatorReceiver
          chainIconInitiator={initiatorNetworkIcon ?? ''}
          chainIconReceiver={receiverNetworkIcon ?? ''}
          chainInitiator={initiatorName}
          chainReceiver={receiverName}
          showName
        />
      </Pod>
      <Pod badgeTitleText="Initiator">
        <InitiatorReceiver
          address={initiator}
          bigNumber
          inline
          scanLink={getExplorerUrl(initiator)}
          token={initiatorNetwork}
          tokenIcon={initiatorTokenIcon}
          tokenValue={formatNumber(initiatorAmount ?? 0)}
        />
      </Pod>
      <Pod badgeTitleText="Receiver">
        <InitiatorReceiver
          address={receiver}
          bigNumber
          inline
          scanLink={getExplorerUrl(receiver)}
          token={receiverNetwork}
          tokenIcon={receiverTokenIcon}
          tokenValue={formatNumber(receiverAmount ?? 0)}
        />
      </Pod>
      {/* @todo - If a signature fails it has to change state */}
      <Pod badgeSubTitleText={transactionStatus} badgeTitleText="Status" status={transactionStatus}>
        {/* @todo:
         - if transactionStatus is not completed, completed value must be empty
        */}
        <TransactionDate
          completed={transformDate(timestampExecution)}
          started={transformDate(timestampStarted)}
        />
      </Pod>
    </Wrapper>
  )
}
