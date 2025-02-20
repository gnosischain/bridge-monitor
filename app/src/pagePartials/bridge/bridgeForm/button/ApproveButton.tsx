import React, { useState } from 'react'
import { BigNumber } from 'ethers'
import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { getBridgeContract } from '@/src/hooks/bridge/useBridgeContracts'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { Button } from './Button'
import { ButtonPlaceholderWithWarning } from './ButtonPlaceholderWithWarning'

interface ApproveButtonProps {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  amount: BigNumber
}

export const ApproveButton: React.FC<ApproveButtonProps> = ({
  amount,
  fromChainId,
  toChainId,
  token,
  userAddress,
}) => {
  const [isSending, setIsSending] = useState(false)

  const approve = useApproval()

  const bridgeContract = getBridgeContract(fromChainId, toChainId, token.address)
  const bridgeAddress = bridgeContract.address

  const { mutate: refreshBalance } = useUserTokenBalances({
    userAddress,
    chainId: fromChainId,
    allowanceAddress: bridgeAddress,
    tokenAddress: token.address,
  })

  const handleApprove = async () => {
    setIsSending(true)

    const tx = await approve({
      amount,
      spenderAddress: bridgeAddress,
      tokenAddress: token.address,
    })

    if (tx) {
      await tx.wait()
      await refreshBalance()
    }

    setIsSending(false)
  }

  if (isSending) {
    return <ButtonPlaceholderWithWarning action="approving" />
  }

  return <Button onClick={handleApprove}>Approve</Button>
}
