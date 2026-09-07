import { AlertMessage } from '@/src/components/error/AlertMessage'
import { ChainsValues } from '@/src/constants/config/types'
import { useBridgeValidations } from '@/src/hooks/bridge/useBridgeValidations'
import { TxPreview, TxPreviewLoading } from '@/src/pagePartials/bridge/bridgeForm/TxPreview'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { Token } from '@/types/token'
import { genericSuspense } from '@/src/components/safeSuspense'
import React from 'react'
import { getBridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import useWeb3Name from '@/src/hooks/useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'

export const BridgeSummary: React.FC<{
  receiveNativeToken: boolean
  recipient: string
  amount: bigint
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
    const bridgeAddress = getBridgeContractConfig(fromChainId, toChainId, token.address).address

    const { isResolvingAddress, resolvedAddress } = useWeb3Name({
      name: isValidDomainName(recipient) ? recipient : undefined,
    })
    const recipientAddress = resolvedAddress ?? recipient

    const { data: addressBalances } = useUserTokenBalances({
      userAddress,
      allowanceAddress: bridgeAddress,
      chainId: fromChainId,
      tokenAddress: token.address,
    })

    const { errorMessage } = useBridgeValidations({
      amount,
      fromChainId,
      recipient: recipientAddress,
      toChainId,
      fromToken: token,
      toToken: tokenOut,
      userAddress,
    })

    if (!addressBalances || isResolvingAddress) return <TxPreviewLoading />

    return errorMessage ? (
      <AlertMessage text={errorMessage} />
    ) : (
      <TxPreview
        amount={amount}
        fromChainId={fromChainId}
        receiveNativeToken={receiveNativeToken}
        recipient={recipientAddress}
        toChainId={toChainId}
        token={token}
        tokenOut={tokenOut}
        userAddress={userAddress}
      />
    )
  },
  () => <TxPreviewLoading />,
)
