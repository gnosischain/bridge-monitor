import { Modal } from '@/src/components/modal'
import { StatusDetails } from './StatusDetails'
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { Status } from '@/src/pagePartials/bridgeExplorer/transaction/IconStatus'
import { Chains } from '@/src/constants/config/chains'
import { TRANSMUTER_ADDRESS, ZERO_ADDRESS } from '@/src/constants/misc'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { BigNumber } from 'ethers'
import { Approve } from './Approve'
import { Swap } from './Swap'
import { Bridge } from './Bridge'
import { Token } from '@/types/token'
import { Step, statuses, steps } from './const'
import { BridgeButtonDisabled } from './BridgeButtonDisabled'

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
  amount: BigNumber
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

  const { data: userBalanceData, mutate: refreshBalanceToken } = useUserTokenBalances({
    userAddress: userAddress || ZERO_ADDRESS,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: tokenIn.address,
  })

  if (!userBalanceData) throw new Error('User balance data is not available')

  const shouldApprove = amount.gt(userBalanceData.allowance) && amount.lte(userBalanceData.balance)

  useEffect(() => {
    if (!shouldApprove) {
      setStatus(steps.swapping)
    }
  }, [shouldApprove])

  return (
    <Modal
      onClose={onClose}
      size="md"
      title={`Bridge ${tokenIn.symbol} from Gnosis Chain to ${tokenOut.symbol} Ethereum`}
      {...restProps}
    >
      <StatusList>
        <Approve
          amount={amount}
          approveStatus={status[0]}
          refreshBalanceToken={refreshBalanceToken}
          setStatus={setStatus}
        />
        <Swap amount={amount} setStatus={setStatus} swapStatus={status[1]} />

        <Bridge amount={amount} setStatus={setStatus} bridgeStatus={status[2]} />
        {/* <StatusDetails
          description="3. Bridge USDC to Ethereum"
          statusIcon={statuses.bridge[status[2]].statusIcon as Status}
          // title={statuses.bridge[status[2]].title}
          transactionStatus="Bridge"
        >
          {status[2] !== 'now' && status[2] !== 'pending' ? (
            <BridgeButtonDisabled />
          ) : (
            <BridgeButton
              amount={amount}
              disabled={false}
              recipient={recipient || userAddress}
              setStatus={setStatus}
              token={tokenIn}
              userAddress={userAddress || ''}
            />
          )}
        </StatusDetails> */}
      </StatusList>
    </Modal>
  )
}
