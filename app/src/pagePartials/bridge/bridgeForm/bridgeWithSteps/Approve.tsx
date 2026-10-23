import { TRANSMUTER_ADDRESS, USDCe_GNOSIS } from '@/src/constants/misc'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { useEffect, useMemo, useState } from 'react'
import { Step, statuses, steps } from './const'
import { StatusDetails } from './StatusDetails'
import { StepButton } from './StepButton'
import { Status } from '@/src/pagePartials/bridgeExplorer/transaction/IconStatus'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { Chains } from '@/src/constants/config/chains'
import { Token } from '@/types/token'
import { zeroAddress } from 'viem'
import { waitForMinedReceipt } from '@/src/lib/web3/transactions'

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
    userAddress: userAddress || zeroAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: tokenIn.address,
  })

  const shouldApprove =
    !!userBalanceData && amount > userBalanceData.allowance && amount <= userBalanceData.balance

  useEffect(() => {
    if (!userBalanceData) return

    if (shouldApprove && approveStatus === 'now' && !showButton) {
      setStatus(steps.approving)
    }

    if (!shouldApprove && approveStatus === 'now') {
      setStatus(steps.swapping)
    }
  }, [shouldApprove, approveStatus, setStatus, showButton, userBalanceData])

  const runApprove = useMemo(
    () => async () => {
      setIsWorking(true)
      try {
        const hash = await approve({
          amount,
          chainId: Chains.gnosis,
          spenderAddress: TRANSMUTER_ADDRESS,
          tokenAddress: USDCe_GNOSIS,
        })
        if (!hash) throw new Error('Approval was not submitted')

        // block until the approval is mined; this rejects on revert or receipt timeout, so the
        // catch below re-shows the button instead of advancing to the swap
        await waitForMinedReceipt(hash, Chains.gnosis)
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
        <StepButton disabled={isWorking} onClick={handleApprove} {...restProps}>
          {isWorking ? 'Approving' : 'Approve'}
        </StepButton>
      )}
    </StatusDetails>
  )
}
