import { TRANSMUTER_ADDRESS, USDCe_GNOSIS } from '@/src/constants/misc'
import { useApproval } from '@/src/hooks/bridge/useApproval'
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

type ApproveButtonProps = {
  amount: BigNumber
  setStatus: (status: Step[]) => void
  refreshBalanceToken: () => void
  disabled: boolean
}

export const ApproveButton = ({
  amount,
  disabled,
  refreshBalanceToken,
  setStatus,
  ...restProps
}: ApproveButtonProps) => {
  const approve = useApproval()
  const [isWorking, setIsWorking] = useState(false)

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setIsWorking(true)
    setStatus(steps.approving)
    try {
      const receipt = await approve({
        amount,
        spenderAddress: TRANSMUTER_ADDRESS,
        tokenAddress: USDCe_GNOSIS,
      })
      if (!receipt) throw new Error('No receipt')

      if (receipt) {
        await receipt.wait()
        setStatus(steps.swap)
        refreshBalanceToken()
      } else {
        throw new Error('Failed to approve')
      }
    } catch (e) {
      console.error(e)
      setStatus(steps.approve)
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Wrapper disabled={isWorking || disabled} onClick={handleApprove} {...restProps}>
      {isWorking ? 'Approving' : 'Approve'}
    </Wrapper>
  )
}
