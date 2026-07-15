import styled from 'styled-components'
import { ButtonFull } from '@/src/components/buttons/Button'
import { Connect } from '@/src/components/assets/Connect'
import { Chains } from '@/src/constants/config/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { useEffect, useState } from 'react'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import useTransaction from '@/src/hooks/useTransaction'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { waitForMinedReceipt } from '@/src/lib/web3/transactions'
import useWeb3Name from '@/src/hooks/useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { TokenUsdc } from './types'
import { TRANSMUTER_ADDRESS } from '@/src/constants/misc'
import { useTransmuterTxInfo } from '@/src/hooks/usdcTransmuter/useTransmuterTxInfo'
import { usdcTokens } from '@/src/constants/usdcTokens'

const Button = styled(ButtonFull)`
  margin: 0 auto;
  width: 100%;
`

const BottomInfo = styled.p`
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  text-align: center;
  color: rgb(221, 113, 67);

  a {
    color: rgb(221, 113, 67);
  }
`

export const ButtonPlaceholder: React.FC = () => <Button disabled>Loading...</Button>

export const ButtonPlaceholderWithWarning: React.FC<{
  action: string
}> = ({ action }) => {
  const { isSCWallet } = useWeb3Connection()

  return (
    <>
      <ButtonPlaceholder />
      {isSCWallet && (
        <BottomInfo>
          When using a smart contract wallet, if transaction is executed but the {action} status
          remains unchanged, just reload the page.
        </BottomInfo>
      )}
    </>
  )
}

export const DisabledTransButton = () => (
  <Button disabled={true} onClick={() => undefined}>
    Swap
  </Button>
)

const ApproveButton: React.FC<{
  userAddress: string
  token: TokenUsdc
  amount: bigint
}> = ({ amount, token, userAddress }) => {
  const [isSending, setIsSending] = useState(false)
  const [isComponentMounted, setIsComponentMounted] = useState(true)

  useEffect(() => {
    setIsComponentMounted(true)

    return () => {
      setIsComponentMounted(false)
    }
  }, [])

  const approve = useApproval()

  const { refetch: refreshBalanceToken } = useUserTokenBalances({
    userAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: token.address,
  })

  // const tokenOutAddress =
  //   token.address === usdcTokens.usdcXdaiOld.address
  //     ? usdcTokens.usdceGnosis.address
  //     : usdcTokens.usdcXdaiOld.address
  // const { mutate: refreshBalanceTokenOut } = useUserTokenBalances({
  //   userAddress,
  //   chainId: Chains.gnosis,
  //   tokenAddress: tokenOutAddress,
  // })

  const handleApprove = async () => {
    setIsSending(true)

    try {
      const tx = await approve({
        amount,
        spenderAddress: TRANSMUTER_ADDRESS,
        tokenAddress: token.address,
      })

      if (tx) {
        await tx.wait()
        await refreshBalanceToken()
        // await refreshBalanceTokenOut()
      }
    } catch (e) {
      // `wait()` throws on revert or on viem's 180s receipt timeout — don't leave the
      // button stuck on the "approving" placeholder
      console.error(e)
    } finally {
      if (isComponentMounted) {
        setIsSending(false)
      }
    }
  }

  if (isSending) {
    return <ButtonPlaceholderWithWarning action="approving" />
  }

  return <Button onClick={handleApprove}>Approve</Button>
}

const TriggerTransButton: React.FC<{
  amount: bigint
  token: TokenUsdc
  userAddress: string
  clearForm: () => void
}> = ({ amount, clearForm, token, userAddress }) => {
  const [isSending, setIsSending] = useState(false)
  const [isComponentMounted, setIsComponentMounted] = useState(true)

  const sendTx = useTransaction()
  // const router = useRouter()

  const { refetch: refreshBalanceToken } = useUserTokenBalances({
    userAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: token.address,
  })

  const tokenOutAddress =
    token.address === usdcTokens.usdcXdaiOld.address
      ? usdcTokens.usdceGnosis.address
      : usdcTokens.usdcXdaiOld.address
  const { refetch: refreshBalanceTokenOut } = useUserTokenBalances({
    userAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: tokenOutAddress,
  })

  const transactionData = useTransmuterTxInfo({ amount, token, userAddress })

  useEffect(() => {
    setIsComponentMounted(true)

    return () => {
      setIsComponentMounted(false)
    }
  }, [])

  const handleTransTx = async () => {
    if (!transactionData || !transactionData.tx) return

    setIsSending(true)

    try {
      const hash = await sendTx(transactionData.tx)
      if (hash) {
        await waitForMinedReceipt(hash, Chains.gnosis)
        clearForm()
        Promise.all([refreshBalanceToken(), refreshBalanceTokenOut()])
      } else {
        throw new Error('Failed to swap')
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (isComponentMounted) {
        setIsSending(false)
      }
    }
  }

  if (isSending) {
    return <ButtonPlaceholderWithWarning action="swapping" />
  }

  if (!transactionData) {
    return <DisabledTransButton />
  }

  return <Button onClick={handleTransTx}>Swap</Button>
}

export const TransButton: React.FC<{
  amount: bigint
  fromToken: TokenUsdc
  userAddress: string
  clearForm: () => void
}> = ({ amount, clearForm, fromToken, userAddress }) => {
  const {
    connectWallet,
    connectingWallet,
    isOnboardChangingChain,
    isWalletConnected,
    isWalletNetworkSupported,
    pushNetwork,
    walletChainId,
  } = useWeb3Connection()

  const appChainConfig = getNetworkConfig(Chains.gnosis)

  const { resolvedAddress } = useWeb3Name({
    name: isValidDomainName(userAddress) ? userAddress : undefined,
  })
  const recipientAddress = resolvedAddress ?? userAddress

  const { data: userBalanceData } = useUserTokenBalances({
    userAddress: recipientAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: fromToken.address,
  })

  if (!userBalanceData) {
    return <ButtonPlaceholder />
  }

  const isValidToSend = amount > 0n && amount <= userBalanceData.balance
  const shouldApprove = amount > userBalanceData.allowance && amount <= userBalanceData.balance

  if (!isValidToSend) {
    return <DisabledTransButton />
  }

  const hasToSwitchNetwork =
    (isWalletConnected && !isWalletNetworkSupported) || Chains.gnosis !== walletChainId

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
      <Button onClick={() => pushNetwork(appChainConfig.chainId)}>
        {`Switch to ${appChainConfig.name}`}
      </Button>
    )
  }

  if (shouldApprove) {
    return <ApproveButton amount={amount} token={fromToken} userAddress={userAddress} />
  }

  return (
    <TriggerTransButton
      amount={amount}
      clearForm={clearForm}
      token={fromToken}
      userAddress={userAddress}
    />
  )
}
