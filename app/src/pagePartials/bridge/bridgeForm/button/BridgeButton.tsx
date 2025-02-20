import React from 'react'
import { BigNumber } from 'ethers'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getNetworkConfig } from '@/src/constants/config/chains'
import useWeb3Name from '@/src/hooks/useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { useBridgeValidations } from '@/src/hooks/bridge/useBridgeValidations'
import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { ApproveButton } from './ApproveButton'
import { TriggerBridgeButton } from './TriggerBridgeButton'
import { DisabledBridgeButton } from './DisabledBridgeButton'
import { Connect } from '@/src/components/assets/Connect'
import { ButtonFull } from '@/src/components/buttons/Button'
import styled from 'styled-components'
import { SwapAndBridge } from './SwapAndBridge'

const Button = styled(ButtonFull)`
  margin: 0 auto;
  width: 100%;
`

interface BridgeButtonProps {
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: BigNumber
  recipient: string
  fromToken: Token
  isUsdceGC: boolean
  userAddress: string
  toToken?: Token
  receiveNativeToken: boolean
}

export const BridgeButton: React.FC<BridgeButtonProps> = ({
  amount,
  fromChainId,
  fromToken,
  isUsdceGC,
  receiveNativeToken,
  recipient,
  toChainId,
  toToken,
  userAddress,
}) => {
  const {
    connectWallet,
    connectingWallet,
    isOnboardChangingChain,
    isWalletConnected,
    isWalletNetworkSupported,
    pushNetwork,
    walletChainId,
  } = useWeb3Connection()

  const appChainConfig = getNetworkConfig(fromChainId)

  // Resolve recipient in case it is a domain name.
  const { resolvedAddress } = useWeb3Name({
    name: isValidDomainName(recipient) ? recipient : undefined,
  })
  const recipientAddress = resolvedAddress ?? recipient

  const { isValidToSend: canBridge, shouldApprove } = useBridgeValidations({
    fromChainId,
    toChainId,
    userAddress,
    amount,
    recipient: recipientAddress,
    fromToken,
    toToken,
  })

  const hasToSwitchNetwork =
    (isWalletConnected && !isWalletNetworkSupported) || fromChainId !== walletChainId

  if (isOnboardChangingChain) {
    return <div>Loading...</div>
  }

  if (!isWalletConnected) {
    return (
      <Button onClick={connectWallet}>
        {connectingWallet ? (
          'Connecting wallet...'
        ) : (
          <>
            <Connect /> Connect Wallet
          </>
        )}
      </Button>
    )
  }

  if (hasToSwitchNetwork) {
    return (
      <Button onClick={() => pushNetwork({ chainId: appChainConfig.chainIdHex })}>
        {`Switch to ${appChainConfig.name}`}
      </Button>
    )
  }

  if (!canBridge) {
    return <DisabledBridgeButton />
  }

  if (isUsdceGC) {
    return (
      <SwapAndBridge
        amount={amount}
        recipient={recipient}
        tokenIn={fromToken}
        tokenOut={toToken}
        userAddress={userAddress}
      />
    )
  }

  if (shouldApprove) {
    return (
      <ApproveButton
        amount={amount}
        fromChainId={fromChainId}
        toChainId={toChainId}
        token={fromToken}
        userAddress={userAddress}
      />
    )
  }

  return (
    <TriggerBridgeButton
      amount={amount}
      fromChainId={fromChainId}
      receiveNativeToken={receiveNativeToken}
      recipient={recipientAddress}
      toChainId={toChainId}
      token={fromToken}
      userAddress={userAddress}
    />
  )
}
