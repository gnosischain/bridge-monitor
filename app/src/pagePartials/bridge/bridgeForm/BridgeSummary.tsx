import { AlertMessage } from '@/src/components/error/AlertMessage'
import { ChainsValues } from '@/src/constants/config/types'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { useBridgeValidations } from '@/src/hooks/bridge/useBridgeValidations'
import { TxPreview, TxPreviewLoading } from '@/src/pagePartials/bridge/bridgeForm/TxPreview'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { Token } from '@/types/token'
import { BigNumber } from 'ethers'
import { genericSuspense } from '@/src/components/safeSuspense'
import React from 'react'

export const BridgeSummary: React.FC<{
  receiveNativeToken: boolean
  recipient: string
  amount: BigNumber
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  tokenOut: Token
}> = genericSuspense(
  ({
    amount,
    fromChainId,
    receiveNativeToken,
    recipient,
    toChainId,
    token,
    tokenOut,
    userAddress,
  }) => {
    const { getFromBridgeWithSigner } = useBridgeContracts()
    const fromBridgeAddress = getFromBridgeWithSigner(fromChainId, toChainId, token.address).address

    const { data: addressBalances } = useUserTokenBalances({
      userAddress,
      allowanceAddress: fromBridgeAddress,
      chainId: fromChainId,
      tokenAddress: token.address,
    })
    if (!addressBalances) throw new Error('Address balances are not available')

    const { errorMessage } = useBridgeValidations({
      amount,
      fromChainId,
      recipient,
      toChainId,
      fromToken: token,
      userAddress,
    })

    return errorMessage ? (
      <AlertMessage text={errorMessage} />
    ) : (
      <TxPreview
        amount={amount}
        fromChainId={fromChainId}
        receiveNativeToken={receiveNativeToken}
        recipient={recipient}
        toChainId={toChainId}
        token={token}
        tokenOut={tokenOut}
        userAddress={userAddress}
      />
    )
  },
  () => <TxPreviewLoading />,
)
