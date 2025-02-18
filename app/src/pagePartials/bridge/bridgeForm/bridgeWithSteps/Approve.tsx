import { TRANSMUTER_ADDRESS, USDCe_GNOSIS } from '@/src/constants/misc'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { BigNumber } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Step, statuses, steps } from './const'
import { StatusDetails } from './StatusDetails'
import { Status } from '@/src/pagePartials/bridgeExplorer/transaction/IconStatus'

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

type ApproveProps = {
  amount: BigNumber
  approveStatus: Step
  setStatus: (status: Step[]) => void
  refreshBalanceToken: () => void
}

export const Approve = ({
  amount,
  approveStatus,
  refreshBalanceToken,
  setStatus,
  ...restProps
}: ApproveProps) => {
  const approve = useApproval()
  const [isWorking, setIsWorking] = useState(false)
  const [showButton, setShowButton] = useState(false)

  const runApprove = useMemo(
    () => async () => {
      console.log('running approve')
      setIsWorking(true)
      try {
        const receipt = await approve({
          amount,
          spenderAddress: TRANSMUTER_ADDRESS,
          tokenAddress: USDCe_GNOSIS,
        })
        if (!receipt) throw new Error('No receipt')

        await receipt.wait()
        setStatus(steps.swapping)
        refreshBalanceToken()
      } catch (e) {
        console.error(e)
        setStatus(steps.approve)
        setShowButton(true)
      } finally {
        setIsWorking(false)
      }
    },
    [approve, amount, refreshBalanceToken, setStatus, setShowButton],
  )

  const handleApprove = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setStatus(steps.approving)
    await runApprove()
  }

  useEffect(() => {
    console.log('approveStatus', approveStatus)
    if (approveStatus === 'pending' && !isWorking) {
      runApprove()
    }
  }, [approveStatus, isWorking, runApprove])

  return (
    <StatusDetails
      description={approveStatus === 'pending' ? statuses.approve.pending.title : ''}
      statusIcon={statuses.approve[approveStatus].statusIcon as Status}
      title="1. Grant permission to spend tokens"
      transactionStatus={statuses.approve[approveStatus].text}
    >
      {showButton && (
        <Wrapper disabled={isWorking} onClick={handleApprove} {...restProps}>
          {isWorking ? 'Approving' : 'Approve'}
        </Wrapper>
      )}
    </StatusDetails>
  )
}
