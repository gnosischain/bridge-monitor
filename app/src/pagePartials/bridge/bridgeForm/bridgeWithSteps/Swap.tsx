import { TRANSMUTER_ADDRESS, USDCe_GNOSIS, ZERO_ADDRESS } from '@/src/constants/misc'
import { useTransmuterTxInfo } from '@/src/hooks/usdcTransmuter/useTransmuterTxInfo'
import useTransaction from '@/src/hooks/useTransaction'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { BigNumber } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Step, statuses, steps } from './const'
import { StatusDetails } from './StatusDetails'
import { Status } from './IconStatus'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { Token } from '@/types/token'
import { Chains } from '@/src/constants/config/chains'

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

  &:active {
    opacity: 0.7;
  }

  &:hover {
    opacity: 0.8;
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

type SwapProps = {
  amount: BigNumber
  userAddress: string
  tokenIn: Token
  setStatus: (status: Step[]) => void
  swapStatus: Step
}

export const Swap = ({
  amount,
  setStatus,
  swapStatus,
  tokenIn,
  userAddress,
  ...restProps
}: SwapProps) => {
  const [isWorking, setIsWorking] = useState(false)
  const { address } = useWeb3Connection()
  const [showButton, setShowButton] = useState(false)
  const sendTx = useTransaction()
  const disabled = swapStatus !== 'now' && swapStatus !== 'pending'

  const { refetch: refreshBalanceToken } = useUserTokenBalances({
    userAddress: userAddress || ZERO_ADDRESS,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: tokenIn.address,
  })

  const swapTxData = useTransmuterTxInfo({
    amount,
    token: { address: USDCe_GNOSIS } as TokenUsdc,
    userAddress: address || ZERO_ADDRESS,
    returnZero: disabled,
  })

  const runSwap = useMemo(
    () => async () => {
      if (!swapTxData || !swapTxData.tx) return
      setIsWorking(true)

      try {
        const tx = await sendTx(swapTxData.tx)
        if (tx) {
          await tx.wait()
          refreshBalanceToken()
          setStatus(steps.bridging)
        } else {
          throw new Error('Failed to swap')
        }
      } catch (error) {
        console.error(error)
        setStatus(steps.swap)
        setShowButton(true)
      } finally {
        setIsWorking(false)
      }
    },
    [refreshBalanceToken, sendTx, setStatus, swapTxData],
  )

  const handleSwap = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setStatus(steps.swapping)
    await runSwap()
  }

  useEffect(() => {
    if (swapStatus === 'pending' && !isWorking && swapTxData && swapTxData.tx) {
      runSwap()
    }
  }, [swapStatus, isWorking, runSwap, swapTxData])

  return (
    <StatusDetails
      description={swapStatus === 'pending' ? statuses.swap.pending.title : ''}
      statusIcon={statuses.swap[swapStatus].statusIcon as Status}
      title="Swap USDC.e to USDC"
      transactionStatus={statuses.swap[swapStatus].text}
    >
      {showButton && (
        <Wrapper disabled={isWorking || disabled} onClick={handleSwap} {...restProps}>
          {isWorking ? 'Swapping' : 'Swap'}
        </Wrapper>
      )}
    </StatusDetails>
  )
}
