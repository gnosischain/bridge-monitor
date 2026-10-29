import { TRANSMUTER_ADDRESS, USDCe_GNOSIS } from '@/src/constants/misc'
import { useTransmuterTxInfo } from '@/src/hooks/usdcTransmuter/useTransmuterTxInfo'
import useTransaction from '@/src/hooks/useTransaction'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useEffect, useMemo, useState } from 'react'
import { Step, statuses, steps } from './const'
import { StatusDetails } from './StatusDetails'
import { StepButton } from './StepButton'
import { Status } from './IconStatus'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { waitForMinedReceipt } from '@/src/lib/web3/transactions'
import { Token } from '@/types/token'
import { Chains } from '@/src/constants/config/chains'
import { zeroAddress } from 'viem'

type SwapProps = {
  amount: bigint
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
    userAddress: userAddress || zeroAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: tokenIn.address,
  })

  const swapTxData = useTransmuterTxInfo({
    amount,
    token: { address: USDCe_GNOSIS } as TokenUsdc,
    userAddress: address || zeroAddress,
    returnZero: disabled,
  })

  const runSwap = useMemo(
    () => async () => {
      if (!swapTxData || !swapTxData.calls) return
      setIsWorking(true)

      try {
        const hash = await sendTx({ calls: swapTxData.calls, chainId: Chains.gnosis })
        if (hash) {
          await waitForMinedReceipt(hash, Chains.gnosis)
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
    if (swapStatus === 'pending' && !isWorking && swapTxData && swapTxData.calls) {
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
        <StepButton disabled={isWorking || disabled} onClick={handleSwap} {...restProps}>
          {isWorking ? 'Swapping' : 'Swap'}
        </StepButton>
      )}
    </StatusDetails>
  )
}
