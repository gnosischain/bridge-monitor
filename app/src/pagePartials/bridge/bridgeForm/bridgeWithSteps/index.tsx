import { Modal } from '@/src/components/modal'
import styled from 'styled-components'
import { useState } from 'react'
import { Approve } from './Approve'
import { Swap } from './Swap'
import { Bridge } from './Bridge'
import { Token } from '@/types/token'
import { Step, steps } from './const'
import { formatUnits } from 'viem'

const StatusList = styled.div`
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2)
    calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    padding: calc(var(--theme-common-space) * 5) calc(var(--theme-common-space) * 4);
  }
`

type BridgeWithStepsProps = {
  tokenIn: Token
  tokenOut: Token
  amount: bigint
  onClose: () => void
  recipient: string
  userAddress: string
}

export const BridgeWithSteps: React.FC<BridgeWithStepsProps> = ({
  amount,
  onClose,
  recipient,
  tokenIn,
  tokenOut,
  userAddress,
  ...restProps
}) => {
  const [status, setStatus] = useState<Step[]>(steps.approve)

  const formattedAmount = formatUnits(amount, tokenIn?.decimals)

  return (
    <Modal
      onClose={onClose}
      size="md"
      title={`Bridge ${formattedAmount} ${tokenIn.symbol} from Gnosis Chain to ${tokenOut.symbol} Ethereum`}
      {...restProps}
    >
      <StatusList>
        <Approve
          amount={amount}
          approveStatus={status[0]}
          setStatus={setStatus}
          tokenIn={tokenIn}
          userAddress={userAddress}
        />

        <Swap
          amount={amount}
          setStatus={setStatus}
          swapStatus={status[1]}
          tokenIn={tokenIn}
          userAddress={userAddress}
        />

        <Bridge
          amount={amount}
          bridgeStatus={status[2]}
          recipient={recipient || userAddress}
          setStatus={setStatus}
          token={tokenIn}
          userAddress={userAddress || ''}
        />
      </StatusList>
    </Modal>
  )
}
