import React from 'react'
import { useRouter } from 'next/router'
import { formatUnits } from 'viem'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import { bridgePagesBaseURL } from '@/src/constants/sections'
import { chainsConfig } from '@/src/constants/config/chains'
import { ChainsValues } from '@/src/constants/config/types'
import { useTransactionCard } from '@/src/providers/transactionCardProvider'
import { Token } from '@/types/token'
import { Button } from './Button'
import { ButtonPlaceholder } from './ButtonPlaceholder'

interface TriggerBridgeButtonProps {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  amount: bigint
  recipient: string
  receiveNativeToken: boolean
  toToken?: Token
}

export const TriggerBridgeButton: React.FC<TriggerBridgeButtonProps> = ({
  amount,
  fromChainId,
  receiveNativeToken,
  recipient,
  toChainId,
  toToken,
  token,
  userAddress,
}) => {
  const sendTransactions = useTransactionCard()
  const router = useRouter()

  const { data: transactionData, isPending } = useBridgeTransactionInfo({
    receiveNativeToken,
    userAddress,
    fromChainId,
    toChainId,
    amount,
    recipient,
    token,
    toToken,
  })

  if (isPending) return <ButtonPlaceholder />

  if (!transactionData) throw new Error('Transaction data is not available')

  const handleBridgeTx = () => {
    if (!transactionData.calls) {
      console.error('No transactionData.calls')
      return
    }

    sendTransactions({
      calls: transactionData.calls,
      chainId: fromChainId,
      title: `Bridge ${formatUnits(amount, token.decimals)} ${token.symbol} to ${chainsConfig[toChainId].name}`,
      onDone: (txHash) =>
        router.push({
          pathname: `${bridgePagesBaseURL}/${txHash}`,
          query: {
            fromChainId,
            tokenAddress: token.address,
            amount: amount.toString(),
            toChainId,
            submitted: 1,
          },
        }),
    })
  }

  return <Button onClick={handleBridgeTx}>Bridge</Button>
}
