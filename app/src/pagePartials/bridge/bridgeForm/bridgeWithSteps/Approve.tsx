import { TRANSMUTER_ADDRESS, USDCe_GNOSIS, ZERO_ADDRESS } from '@/src/constants/misc'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Step, statuses, steps } from './const'
import { StatusDetails } from './StatusDetails'
import { Status } from '@/src/pagePartials/bridgeExplorer/transaction/IconStatus'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { Token } from '@/types/token'

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
  amount: bigint
  approveStatus: Step
  userAddress: string
  tokenIn: Token
  setStatus: (status: Step[]) => void
}

export const Approve = ({
  amount,
  approveStatus,
  setStatus,
  tokenIn,
  userAddress,
  ...restProps
}: ApproveProps) => {
  const approve = useApproval()
  const [isWorking, setIsWorking] = useState(false)
  const [showButton, setShowButton] = useState(false)

  const { data: userBalanceData, refetch: refreshBalanceToken } = useUserTokenBalances({
    userAddress: userAddress || ZERO_ADDRESS,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: tokenIn.address,
  })

  if (!userBalanceData) throw new Error('User balance data is not available')

  const shouldApprove = amount > userBalanceData.allowance && amount <= userBalanceData.balance

  useEffect(() => {
    if (shouldApprove && approveStatus === 'now' && !showButton) {
      setStatus(steps.approving)
    }

    if (!shouldApprove && approveStatus === 'now') {
      setStatus(steps.swapping)
    }
  }, [shouldApprove, approveStatus, setStatus, showButton])

  const runApprove = useMemo(
    () => async () => {
      setIsWorking(true)
      try {
        await approve({
          amount,
          spenderAddress: TRANSMUTER_ADDRESS,
          tokenAddress: USDCe_GNOSIS,
        })
        setStatus(steps.swapping)
        refreshBalanceToken()
        if (showButton) setShowButton(false)
      } catch (e) {
        console.error(e)
        setStatus(steps.approve)
        setShowButton(true)
      } finally {
        setIsWorking(false)
      }
    },
    [approve, amount, setStatus, refreshBalanceToken, showButton],
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
    if (approveStatus === 'pending' && !isWorking) {
      runApprove()
    }
  }, [approveStatus, isWorking, runApprove])

  return (
    <StatusDetails
      description={approveStatus === 'pending' ? statuses.approve.pending.title : ''}
      statusIcon={statuses.approve[approveStatus].statusIcon as Status}
      title="Grant permission to spend tokens"
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
