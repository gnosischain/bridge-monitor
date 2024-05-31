import styled from 'styled-components'
import { ButtonFull } from '@/src/components/buttons/Button'
import { Connect } from '@/src/components/assets/Connect'
import { Chains } from '@/src/constants/config/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { useState } from 'react'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import useTransaction from '@/src/hooks/useTransaction'
import { BigNumber } from 'ethers'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import useWeb3Name from '@/src/hooks/useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { TokenUsdc } from './types'
import { TRANSMUTER_ADDRESS } from './const'
import { useTransmuterTxInfo } from '@/src/hooks/usdcTransmuter/useTransmuterTxInfo'

const Button = styled(ButtonFull)`
  margin: 0 auto;
  width: 100%;
`

// const BottomInfo = styled.p`
//   font-size: 1.4rem;
//   font-weight: 400;
//   line-height: 1.2;
//   margin: 0;
//   text-align: center;
//   color: rgb(221, 113, 67);

//   a {
//     color: rgb(221, 113, 67);
//   }
// `

export const ButtonPlaceholder: React.FC = () => <Button disabled>Loading...</Button>

export const ButtonPlaceholderWithWarning: React.FC = () => {
  // const { address, readOnlyAppProvider } = useWeb3Connection()
  // const isSCWallet = useSWR(
  //   address && readOnlyAppProvider ? [`isSCWallet-${address}`, address, readOnlyAppProvider] : null,
  //   ([, address, provider]) => provider.getCode(address).then((code) => code !== '0x'),
  // ).data
  // const myTxsLink = `/bridge-explorer/my-transactions?hash=${address}`

  return (
    <>
      <ButtonPlaceholder />
      {/* {isSCWallet && (
        <BottomInfo>
          When using a smart contract wallet, if transaction is executed but the transmutting status
          remains unchanged, go to <a href={myTxsLink}>My Transactions</a> page.
        </BottomInfo>
      )} */}
    </>
  )
}

export const DisabledTransButton = () => (
  <Button disabled={true} onClick={() => undefined}>
    Transmute
  </Button>
)

const ApproveButton: React.FC<{
  userAddress: string
  token: TokenUsdc
  amount: BigNumber
}> = ({ amount, token, userAddress }) => {
  const [isSending, setIsSending] = useState(false)

  const approve = useApproval()

  const { mutate: refreshBalance } = useUserTokenBalances({
    userAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: token.address,
  })

  const handleApprove = async () => {
    setIsSending(true)

    const tx = await approve({
      amount,
      spenderAddress: TRANSMUTER_ADDRESS,
      tokenAddress: token.address,
    })

    if (tx) {
      await tx.wait()
      await refreshBalance()
    }

    setIsSending(false)
  }

  if (isSending) {
    return <ButtonPlaceholderWithWarning />
  }

  return <Button onClick={handleApprove}>Approve</Button>
}

const TriggerTransButton: React.FC<{
  amount: BigNumber
  token: TokenUsdc
  userAddress: string
  clearForm: () => void
}> = ({ amount, clearForm, token, userAddress }) => {
  const [isSending, setIsSending] = useState(false)

  const { walletChainId, web3Provider } = useWeb3Connection()
  if (!web3Provider) throw new Error('No web3 provider available')
  if (walletChainId !== Chains.gnosis) throw new Error('Invalid chain')

  const sendTx = useTransaction()
  // const router = useRouter()

  const { mutate: refreshBalance } = useUserTokenBalances({
    userAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: token.address,
  })

  const transactionData = useTransmuterTxInfo({ amount, token, userAddress })

  const handleTransTx = async () => {
    if (!transactionData || !transactionData.tx) return

    setIsSending(true)

    try {
      const tx = await sendTx(transactionData.tx)
      if (tx) {
        await tx.wait()
        clearForm()
        await refreshBalance()
      } else {
        throw new Error('Failed to swap')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  if (isSending) {
    return <ButtonPlaceholderWithWarning />
  }

  if (!transactionData) {
    return <DisabledTransButton />
  }

  return <Button onClick={handleTransTx}>Transmute</Button>
}

export const TransButton: React.FC<{
  amount: BigNumber
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

  if (!userBalanceData) throw new Error('User balance data is not available')

  const isValidToSend = amount.gt(0) && amount.lte(userBalanceData.balance)
  const shouldApprove = amount.gt(userBalanceData.allowance) && amount.lte(userBalanceData.balance)

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
      <Button onClick={() => pushNetwork({ chainId: appChainConfig.chainIdHex })}>
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
