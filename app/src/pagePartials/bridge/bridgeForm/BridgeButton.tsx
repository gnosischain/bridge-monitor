import styled from 'styled-components'
import { ButtonFull } from '@/src/components/buttons/Button'
import { Connect } from '@/src/components/assets/Connect'
import { ChainsValues } from '@/src/constants/config/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { useState } from 'react'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import useTransaction from '@/src/hooks/useTransaction'
import { useRouter } from 'next/router'
import { useBridgeValidations } from '@/src/hooks/bridge/useBridgeValidations'
import { BigNumber } from 'ethers'
import { Token } from '@/types/token'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import { bridgePagesBaseURL } from '@/src/constants/sections'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'

const Button = styled(ButtonFull)`
  margin: 0 auto;
  width: 100%;
`

export const ButtonPlaceholder: React.FC = () => <Button disabled>Loading...</Button>

const ApproveButton: React.FC<{
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  amount: BigNumber
}> = ({ amount, fromChainId, toChainId, token, userAddress }) => {
  const [isSending, setIsSending] = useState(false)

  const approve = useApproval()
  const { getFromBridgeWithSigner } = useBridgeContracts()
  const fromBridgeAddress = getFromBridgeWithSigner(fromChainId, toChainId, token.address).address

  const { mutate: refreshBalance } = useUserTokenBalances({
    userAddress,
    chainId: fromChainId,
    allowanceAddress: fromBridgeAddress,
    tokenAddress: token.address,
  })

  const handleApprove = async () => {
    setIsSending(true)

    const tx = await approve({
      amount,
      spenderAddress: fromBridgeAddress,
      tokenAddress: token.address,
    })

    if (tx) {
      await tx.wait()
      await refreshBalance()
    }

    setIsSending(false)
  }

  if (isSending) {
    return <ButtonPlaceholder />
  }

  return <Button onClick={handleApprove}>Approve</Button>
}

const TriggerBridgeButton: React.FC<{
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  amount: BigNumber
  recipient: string
  receiveNativeToken: boolean
}> = ({ amount, fromChainId, receiveNativeToken, recipient, toChainId, token, userAddress }) => {
  const [isSending, setIsSending] = useState(false)

  const sendTx = useTransaction()
  const router = useRouter()

  const { data: transactionData } = useBridgeTransactionInfo({
    receiveNativeToken,
    userAddress,
    fromChainId,
    toChainId,
    amount,
    recipient,
    token,
  })
  if (!transactionData) throw new Error('Transaction data is not available')

  const { isNativeBridge } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress: token.address,
  })

  const handleBridgeTx = async () => {
    setIsSending(true)

    if (!transactionData.tx) {
      console.error('No transactionData.tx')
      return
    }

    try {
      const tx = await sendTx(transactionData.tx)
      if (tx) {
        router.push(
          `${bridgePagesBaseURL}/${tx.hash}?fromChainId=${fromChainId}&isNativeBridge=${
            isNativeBridge ? 1 : 0
          }&tokenAddress=${token?.address}&amount=${amount}&toChainId=${toChainId}`,
        )
      } else {
        throw new Error('Failed to bridge')
      }
    } catch (error) {
      console.error(error)
      setIsSending(false)
    }
  }

  if (isSending) {
    return <ButtonPlaceholder />
  }

  return <Button onClick={handleBridgeTx}>Bridge</Button>
}

export const DisabledBridgeButton = () => (
  <Button disabled={true} onClick={() => undefined}>
    Bridge
  </Button>
)

export const BridgeButton: React.FC<{
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: BigNumber
  recipient: string
  token: Token
  userAddress: string
  receiveNativeToken: boolean
}> = ({ amount, fromChainId, receiveNativeToken, recipient, toChainId, token, userAddress }) => {
  const {
    appChainId,
    connectWallet,
    connectingWallet,
    isOnboardChangingChain,
    isWalletConnected,
    isWalletNetworkSupported,
    pushNetwork,
  } = useWeb3Connection()

  const appChainConfig = getNetworkConfig(fromChainId)

  const { isValidToSend: canBridge, shouldApprove } = useBridgeValidations({
    fromChainId,
    toChainId,
    userAddress,
    amount,
    recipient,
    token,
  })

  const hasToSwitchNetwork =
    (isWalletConnected && !isWalletNetworkSupported) || fromChainId !== appChainId

  if (isOnboardChangingChain) {
    return <ButtonPlaceholder />
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

  if (shouldApprove) {
    return (
      <ApproveButton
        amount={amount}
        fromChainId={fromChainId}
        toChainId={toChainId}
        token={token}
        userAddress={userAddress}
      />
    )
  }

  return (
    <TriggerBridgeButton
      amount={amount}
      fromChainId={fromChainId}
      receiveNativeToken={receiveNativeToken}
      recipient={recipient}
      toChainId={toChainId}
      token={token}
      userAddress={userAddress}
    />
  )
}
