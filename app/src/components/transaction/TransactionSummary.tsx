import styled from 'styled-components'

import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { Pod } from '@/src/components/common/Pod'
import { TransactionDate } from '@/src/components/transaction/TransactionDate'
import { getAddressScanUrl } from '@/src/utils/transactions'
import { Address } from '@/src/components/token/Address'
import { TokenWithValue } from '@/src/components/token/TokenWithValue'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    column-gap: ${({ theme: { common } }) => common.space * 2}px;
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
  transactionStatus: string
  timestampExecution: number
  timestampStarted: number
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
  transactionStatus,
}) => {
  return (
    <Wrapper>
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
        <Value token={initiatorToken} tokenValue={initiatorAmount} />
      </Pod>
      {/* @todo - If a signature fails it has to change state */}
      <Pod status={transactionStatus} subTitle={transactionStatus} title="Status">
        {/* @todo:
         - if transactionStatus is not completed, completed value must be empty
        */}
        <TransactionDate completed={timestampExecution} started={timestampStarted} />
      </Pod>
    </Wrapper>
  )
}
