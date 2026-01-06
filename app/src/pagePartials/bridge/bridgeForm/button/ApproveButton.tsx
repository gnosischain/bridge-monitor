import React, { useState } from 'react'
import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { getBridgeContractAddress } from '@/src/hooks/bridge/useBridgeContracts'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { Button } from './Button'
import { ButtonPlaceholderWithWarning } from './ButtonPlaceholderWithWarning'

interface ApproveButtonProps {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  amount: bigint
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

  const bridgeAddress = getBridgeContractAddress(fromChainId, toChainId, token.address)

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
