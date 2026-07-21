import { Chains } from '@/src/constants/config/chains'
import { bridgePagesBaseURL } from '@/src/constants/sections'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import useTransaction from '@/src/hooks/useTransaction'
import { Token } from '@/types/token'
import router from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Step, statuses, steps } from './const'
import { StatusDetails } from './StatusDetails'
import { Status } from './IconStatus'
import { usdcTokens } from '@/src/constants/usdcTokens'

const Wrapper = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.primary};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border: none;
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: 6px;
  cursor: pointer;
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  height: 28px;
  justify-content: center;
  line-height: 1.2rem;
  min-width: 100px;
  padding: 0 20px;
  text-transform: uppercase;
  transition: all 0.15s ease-out;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.7;
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

type BridgeProps = {
  amount: bigint
  bridgeStatus: Step
  recipient: string
  setStatus: (status: Step[]) => void
  token: Token
  userAddress: string
}

const BridgeActive: React.FC<BridgeProps> = ({
  amount,
  bridgeStatus,
  recipient,
  setStatus,
  token,
  userAddress,
  ...restProps
}) => {
  const [isWorking, setIsWorking] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const sendTx = useTransaction()

  const fromChainId = Chains.gnosis
  const toChainId = Chains.mainnet
  const isNativeBridge = false
  const disabled = bridgeStatus !== 'now' && bridgeStatus !== 'pending'

  const { data: transactionData } = useBridgeTransactionInfo({
    receiveNativeToken: false,
    userAddress,
    fromChainId,
    toChainId,
    amount,
    recipient,
    token: usdcTokens.usdcXdaiOld,
  })

  const runBridge = useMemo(
    () => async () => {
      if (!transactionData || !transactionData.tx) {
        console.error('No transactionData.tx')
        return
      }
      setIsWorking(true)

      try {
        const txHash = await sendTx(transactionData.tx)
        if (txHash) {
          setStatus(steps.completed)
          router.push(
            `${bridgePagesBaseURL}/${txHash}?fromChainId=${fromChainId}&isNativeBridge=${
              isNativeBridge ? 1 : 0
            }&tokenAddress=${token?.address}&amount=${amount}&toChainId=${toChainId}&submitted=1`,
          )
        } else {
          throw new Error('Failed to bridge')
        }
      } catch (error) {
        setStatus(steps.bridge)
        setShowButton(true)
        console.error(error)
      } finally {
        setIsWorking(false)
      }
    },
    [
      amount,
      fromChainId,
      isNativeBridge,
      sendTx,
      setStatus,
      toChainId,
      token?.address,
      transactionData,
    ],
  )

  useEffect(() => {
    if (bridgeStatus === 'pending' && !isWorking) {
      runBridge()
    }
  }, [bridgeStatus, isWorking, runBridge])

  const handleBridge = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setStatus(steps.bridging)
    await runBridge()
  }

  return (
    <StatusDetails
      description={bridgeStatus === 'pending' ? statuses.bridge.pending.title : ''}
      statusIcon={statuses.bridge[bridgeStatus].statusIcon as Status}
      title="Bridge USDC to Ethereum"
      transactionStatus={statuses.bridge[bridgeStatus].text}
    >
      {showButton && (
        <Wrapper disabled={isWorking || disabled} onClick={handleBridge} {...restProps}>
          {isWorking ? 'Bridging' : 'Bridge'}
        </Wrapper>
      )}
    </StatusDetails>
  )
}

export const Bridge: React.FC<BridgeProps> = ({
  amount,
  bridgeStatus,
  recipient,
  setStatus,
  token,
  userAddress,
}) => {
  if (bridgeStatus === 'now' || bridgeStatus === 'pending' || bridgeStatus === 'done') {
    return (
      <BridgeActive
        amount={amount}
        bridgeStatus={bridgeStatus}
        recipient={recipient || userAddress}
        setStatus={setStatus}
        token={token}
        userAddress={userAddress || ''}
      />
    )
  } else {
    return (
      <StatusDetails
        description={''}
        statusIcon={statuses.bridge[bridgeStatus].statusIcon as Status}
        title="Bridge USDC to Ethereum"
        transactionStatus="3. Bridge"
      />
    )
  }
}
