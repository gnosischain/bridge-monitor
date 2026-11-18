import styled from 'styled-components'
import { type Address, erc20Abi, formatUnits } from 'viem'
import TransmuterAbi from '@/src/abis/TransmuterEurc'
import { ButtonFull } from '@/src/components/buttons/Button'
import { Connect } from '@/src/components/assets/Connect'
import { Chains } from '@/src/constants/config/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { toCall } from '@/src/lib/web3/transactions'
import { useTransactionCard } from '@/src/providers/transactionCardProvider'
import useWeb3Name from '@/src/hooks/useWeb3Name'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { TokenUsdc } from './types'
import { TRANSMUTER_ADDRESS, USDC_XDAI_OLD } from '@/src/constants/misc'
import { usdcTokens } from '@/src/constants/usdcTokens'

const Button = styled(ButtonFull)`
  margin: 0 auto;
  width: 100%;
`

export const ButtonPlaceholder: React.FC = () => <Button disabled>Loading...</Button>

export const DisabledTransButton = () => (
  <Button disabled={true} onClick={() => undefined}>
    Swap
  </Button>
)

export const TransButton: React.FC<{
  amount: bigint
  fromToken: TokenUsdc
  userAddress: string
  clearForm: () => void
}> = ({ amount, clearForm, fromToken, userAddress }) => {
  const sendTransactions = useTransactionCard()
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

  const handleSwap = () => {
    const isDeposit = fromToken.address === USDC_XDAI_OLD
    const toToken = isDeposit ? usdcTokens.usdceGnosis : usdcTokens.usdcXdaiOld
    // the transmuter pulls the token, so a short allowance is approved first, in the same stack
    const approval =
      amount > userBalanceData.allowance
        ? [
            {
              ...toCall({
                address: fromToken.address as Address,
                abi: erc20Abi,
                functionName: 'approve',
                args: [TRANSMUTER_ADDRESS, amount],
              }),
              label: `Approve ${fromToken.symbol}`,
            },
          ]
        : []

    sendTransactions({
      calls: [
        ...approval,
        {
          ...toCall({
            address: TRANSMUTER_ADDRESS,
            abi: TransmuterAbi,
            functionName: isDeposit ? 'deposit' : 'withdraw',
            args: [amount],
          }),
          label: `Swap ${fromToken.symbol} to ${toToken.symbol}`,
        },
      ],
      chainId: Chains.gnosis,
      title: `Swap ${formatUnits(amount, fromToken.decimals)} ${fromToken.symbol} to ${toToken.symbol}`,
      queuedHint: 'Once your wallet executes it, reload to see your new balances.',
      onDone: clearForm,
    })
  }

  return <Button onClick={handleSwap}>Swap</Button>
}
