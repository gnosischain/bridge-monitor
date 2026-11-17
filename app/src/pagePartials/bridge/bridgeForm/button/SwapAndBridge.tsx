import { useRouter } from 'next/router'
import { type Abi, type Address, erc20Abi, formatUnits } from 'viem'
import ERC677_abi from '@/src/abis/ERC677.json'
import TransmuterAbi from '@/src/abis/TransmuterEurc'
import { Chains, chainsConfig } from '@/src/constants/config/chains'
import { TRANSMUTER_ADDRESS, USDC_XDAI_OLD, USDCe_GNOSIS } from '@/src/constants/misc'
import { bridgePagesBaseURL } from '@/src/constants/sections'
import { getBridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { toCall } from '@/src/lib/web3/transactions'
import { useTransactionCard } from '@/src/providers/transactionCardProvider'
import { Token } from '@/types/token'
import { Button } from './Button'
import { ButtonPlaceholder } from './ButtonPlaceholder'

interface Props {
  amount: bigint
  recipient: string
  userAddress: string
  tokenIn: Token
}

/**
 * USDC.e goes to Ethereum as the bridged USDC the transmuter swaps it for. The calls are encoded
 * here rather than simulated: the swap and the bridge revert until the calls before them have run.
 */
export const SwapAndBridge: React.FC<Props> = ({ amount, recipient, tokenIn, userAddress }) => {
  const sendTransactions = useTransactionCard()
  const router = useRouter()

  const { data: balances } = useUserTokenBalances({
    userAddress,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: USDCe_GNOSIS,
  })

  if (!balances) return <ButtonPlaceholder />

  const handleSwapAndBridge = () => {
    const omniBridge = getBridgeContractConfig(Chains.gnosis, Chains.mainnet, USDC_XDAI_OLD).address
    const approval =
      amount > balances.allowance
        ? [
            {
              ...toCall({
                address: USDCe_GNOSIS,
                abi: erc20Abi,
                functionName: 'approve',
                args: [TRANSMUTER_ADDRESS, amount],
              }),
              label: `Approve ${tokenIn.symbol}`,
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
            functionName: 'withdraw',
            args: [amount],
          }),
          label: `Swap ${tokenIn.symbol} to USDC`,
        },
        {
          // ERC677: the OmniBridge takes it without an approve
          ...toCall({
            address: USDC_XDAI_OLD,
            abi: ERC677_abi as Abi,
            functionName: 'transferAndCall',
            args: [omniBridge as Address, amount, recipient || userAddress],
          }),
          label: `Bridge to ${chainsConfig[Chains.mainnet].name}`,
        },
      ],
      chainId: Chains.gnosis,
      title: `Bridge ${formatUnits(amount, tokenIn.decimals)} ${tokenIn.symbol} to ${chainsConfig[Chains.mainnet].name}`,
      onDone: (txHash) =>
        router.push({
          pathname: `${bridgePagesBaseURL}/${txHash}`,
          query: {
            fromChainId: Chains.gnosis,
            tokenAddress: tokenIn.address,
            amount: amount.toString(),
            toChainId: Chains.mainnet,
            submitted: 1,
          },
        }),
    })
  }

  return <Button onClick={handleSwapAndBridge}>Swap & Bridge</Button>
}
