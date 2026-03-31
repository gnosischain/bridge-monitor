import React from 'react'
import SafeSuspense from '@/src/components/safeSuspense'
import { DisabledBridgeButton } from './DisabledBridgeButton'
import { BridgeButton } from './BridgeButton'
import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { ButtonPlaceholder } from './ButtonPlaceholder'

export interface UnifiedBridgeButtonProps {
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: bigint
  recipient: string
  fromToken?: Token
  isUsdceGC: boolean
  sendToExternalBridge: boolean
  toToken?: Token
  userAddress?: string | null
  receiveNativeToken: boolean
}

/**
 * This component wraps the base BridgeButton by checking that all required
 * values (e.g. token, address, amount) are set. If not—or if the token should be sent
 * via an external bridge or is not properly bridged—the button will be disabled.
 */
export const UnifiedBridgeButton: React.FC<UnifiedBridgeButtonProps> = ({
  amount,
  fromChainId,
  fromToken,
  isUsdceGC,
  receiveNativeToken,
  recipient,
  sendToExternalBridge,
  toChainId,
  toToken,
  userAddress,
}) => {
  const isNotBridgedErc20 =
    toToken &&
    toToken.chainId === 1 &&
    toToken.extensions?.bridgeInfo?.[1]?.tokenAddress === ZERO_ADDRESS

  if (!fromToken || !userAddress || amount === 0n || sendToExternalBridge || isNotBridgedErc20) {
    return <DisabledBridgeButton />
  }

  return (
    <SafeSuspense fallback={<ButtonPlaceholder />}>
      <BridgeButton
        amount={amount}
        fromChainId={fromChainId}
        fromToken={fromToken}
        isUsdceGC={isUsdceGC}
        receiveNativeToken={receiveNativeToken}
        recipient={recipient}
        toChainId={toChainId}
        toToken={toToken}
        userAddress={userAddress}
      />
    </SafeSuspense>
  )
}
