import React, { useState } from 'react'
import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { getBridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { waitForMinedReceipt } from '@/src/lib/web3/transactions'
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

  const bridgeAddress = getBridgeContractConfig(fromChainId, toChainId, token.address).address

  const { refetch: refreshBalance } = useUserTokenBalances({
    userAddress,
    chainId: fromChainId,
    allowanceAddress: bridgeAddress,
    tokenAddress: token.address,
  })

  const handleApprove = async () => {
    setIsSending(true)

    try {
      const hash = await approve({
        amount,
        spenderAddress: bridgeAddress,
        tokenAddress: token.address,
      })

      if (hash) {
        await waitForMinedReceipt(hash, fromChainId)
        await refreshBalance()
      }
    } catch (e) {
      // waitForMinedReceipt rejects on revert or on the receipt-poll timeout — don't leave the
      // button stuck on the "approving" placeholder
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  if (isSending) {
    return <ButtonPlaceholderWithWarning action="approving" />
  }

  return <Button onClick={handleApprove}>Approve</Button>
}
