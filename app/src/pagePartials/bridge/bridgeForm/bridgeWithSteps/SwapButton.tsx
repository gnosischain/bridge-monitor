import { USDCe_GNOSIS, ZERO_ADDRESS } from '@/src/constants/misc'
import { useTransmuterTxInfo } from '@/src/hooks/usdcTransmuter/useTransmuterTxInfo'
import useTransaction from '@/src/hooks/useTransaction'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { BigNumber } from 'ethers'
import { useState } from 'react'
import styled from 'styled-components'
import { Step, steps } from './const'

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

type SwapButtonProps = {
  amount: BigNumber
  setStatus: (status: Step[]) => void
  disabled: boolean
}

export const SwapButton = ({ amount, disabled, setStatus, ...restProps }: SwapButtonProps) => {
  const [isWorking, setIsWorking] = useState(false)
  const { address } = useWeb3Connection()
  const sendTx = useTransaction()

  const swapTxData = useTransmuterTxInfo({
    amount,
    token: { address: USDCe_GNOSIS } as TokenUsdc,
    userAddress: address || ZERO_ADDRESS,
    returnZero: disabled,
  })

  const handleSwap = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (!swapTxData || !swapTxData.tx) return

    setStatus(steps.swapping)
    setIsWorking(true)

    try {
      const tx = await sendTx(swapTxData.tx)
      if (tx) {
        await tx.wait()
        setStatus(steps.bridge)
      } else {
        throw new Error('Failed to swap')
      }
    } catch (error) {
      console.error(error)
      setStatus(steps.swap)
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Wrapper disabled={isWorking || disabled} onClick={handleSwap} {...restProps}>
      {isWorking ? 'Swapping' : 'Swap'}
    </Wrapper>
  )
}
