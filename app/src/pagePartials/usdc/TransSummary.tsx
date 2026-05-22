import { AlertMessage } from '@/src/components/error/AlertMessage'
import { Chains } from '@/src/constants/config/types'
// import { useBridgeValidations } from '@/src/hooks/bridge/useBridgeValidations'
import { TxPreview, TxPreviewLoading } from './TxPreview'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { TokenUsdc } from './types'
import { genericSuspense } from '@/src/components/safeSuspense'
import React from 'react'
import useWeb3Name from '@/src/hooks/useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { TRANSMUTER_ADDRESS } from '@/src/constants/misc'

export const TransSummary: React.FC<{
  amount: bigint
  userAddress: string
  token: TokenUsdc
  tokenOut: TokenUsdc
}> = genericSuspense(
  ({ amount, token, tokenOut, userAddress }) => {
    const { resolvedAddress } = useWeb3Name({
      name: isValidDomainName(userAddress) ? userAddress : undefined,
    })
    const recipientAddress = resolvedAddress ?? userAddress

    const { data: addressBalances } = useUserTokenBalances({
      userAddress: recipientAddress,
      allowanceAddress: TRANSMUTER_ADDRESS,
      chainId: Chains.gnosis,
      tokenAddress: token.address,
    })
    if (!addressBalances) return <TxPreviewLoading />

    if (amount > addressBalances.balance) {
      return <AlertMessage text="Insufficient balance" />
    }

    // if (amount.gt(addressBalances.allowance)) {
    //   return <AlertMessage text="Insufficient allowance" />
    // }
    const errorMessage = ''

    return errorMessage ? (
      <AlertMessage text={errorMessage} />
    ) : (
      <TxPreview amount={amount} token={token} tokenOut={tokenOut} userAddress={userAddress} />
    )
  },
  () => <TxPreviewLoading />,
)
