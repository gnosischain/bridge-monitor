import { Chains } from '@/src/constants/config/chains'
import { bridgePagesBaseURL } from '@/src/constants/sections'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import useTransaction from '@/src/hooks/useTransaction'
import { Token } from '@/types/token'
import { BigNumber } from 'ethers'
import router from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Step, statuses, steps } from './const'
import { USDC_ETHEREUM, USDC_XDAI_OLD } from '@/src/constants/misc'
import { StatusDetails } from './StatusDetails'
import { Status } from './IconStatus'

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

const USDC_GC_BRIDGED = {
  chainId: 100,
  address: USDC_XDAI_OLD,
  decimals: 6,
  logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
  name: 'USDC on xDai',
  symbol: 'USDC',
  extensions: {
    bridgeInfo: {
      '1': {
        tokenAddress: USDC_ETHEREUM,
      },
    },
  },
}

type BridgeProps = {
  amount: BigNumber
  bridgeStatus: Step
  recipient: string
  setStatus: (status: Step[]) => void
  token: Token
  userAddress: string
}

export const Bridge: React.FC<BridgeProps> = ({
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
    token: USDC_GC_BRIDGED,
  })

  const runBridge = useMemo(
    () => async () => {
      if (!transactionData || !transactionData.tx) {
        console.error('No transactionData.tx')
        return
      }
      setIsWorking(true)

      try {
        const tx = await sendTx(transactionData.tx)
        if (tx) {
          setStatus(steps.completed)
          router.push(
            `${bridgePagesBaseURL}/${tx.hash}?fromChainId=${fromChainId}&isNativeBridge=${
              isNativeBridge ? 1 : 0
            }&tokenAddress=${token?.address}&amount=${amount}&toChainId=${toChainId}`,
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
      title="3. Bridge USDC to Ethereum"
      transactionStatus="Bridge"
    >
      {showButton && (
        <Wrapper disabled={isWorking || disabled} onClick={handleBridge} {...restProps}>
          {isWorking ? 'Bridging' : 'Bridge'}
        </Wrapper>
      )}
    </StatusDetails>
  )
}
