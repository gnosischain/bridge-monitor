import { useMemo } from 'react'

import { useSimulateContract } from 'wagmi'

import TransmuterAbi from '@/src/abis/TransmuterEurc'
import { Chains } from '@/src/constants/config/types'
import { TRANSMUTER_ADDRESS, USDC_XDAI_OLD } from '@/src/constants/misc'
import { toCall } from '@/src/lib/web3/transactions'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

/**
 * Simulates the transmuter deposit (USDC → USDC.e) or withdraw (USDC.e → USDC) for
 * `amount` and returns the `calls` executing it. The simulation doubles as the gas
 * estimate and as a pre-flight revert check — a failing simulation yields `calls: null`.
 *
 * Return contract: `undefined` while the wallet isn't on
 * Gnosis or the simulation is in flight; `{ calls: null }` when there is nothing to send
 * (`returnZero`, zero amount, failed simulation); `{ calls }` when ready.
 */
export const useTransmuterTxInfo = ({
  amount,
  returnZero,
  token,
  userAddress,
}: {
  amount: bigint
  token: TokenUsdc
  userAddress: string
  returnZero?: boolean
}) => {
  const { walletChainId } = useWeb3Connection()
  const isReady = walletChainId === Chains.gnosis
  const functionName = token.address === USDC_XDAI_OLD ? 'deposit' : 'withdraw'

  const { data: simulation, isLoading } = useSimulateContract({
    abi: TransmuterAbi,
    address: TRANSMUTER_ADDRESS,
    functionName,
    args: [amount],
    chainId: Chains.gnosis,
    query: {
      enabled: isReady && !returnZero && amount > 0n && !!userAddress,
      retry: false,
    },
  })

  return useMemo(() => {
    if (!isReady || isLoading) return undefined
    if (!simulation?.request) return { calls: null, chainId: Chains.gnosis }
    return {
      calls: [
        toCall({ address: TRANSMUTER_ADDRESS, abi: TransmuterAbi, functionName, args: [amount] }),
      ],
      chainId: Chains.gnosis,
    }
  }, [isReady, isLoading, simulation, functionName, amount])
}
