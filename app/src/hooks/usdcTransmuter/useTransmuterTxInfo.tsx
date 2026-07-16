import { useMemo } from 'react'

import { useSimulateContract, useWriteContract } from 'wagmi'

import TransmuterAbi from '@/src/abis/TransmuterEurc'
import { Chains } from '@/src/constants/config/types'
import { TRANSMUTER_ADDRESS, USDC_XDAI_OLD } from '@/src/constants/misc'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

/**
 * Simulates the transmuter deposit (USDC → USDC.e) or withdraw (USDC.e → USDC) for
 * `amount` and returns a `tx` thunk executing it. The simulation doubles as the gas
 * estimate and as a pre-flight revert check — a failing simulation yields `tx: null`.
 *
 * Return contract (kept from the SWR version): `undefined` while the wallet isn't on
 * Gnosis or the simulation is in flight; `{ tx: null }` when there is nothing to send
 * (`returnZero`, zero amount, failed simulation); `{ tx }` when ready.
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

  const { data: simulation, isLoading } = useSimulateContract({
    abi: TransmuterAbi,
    address: TRANSMUTER_ADDRESS,
    functionName: token.address === USDC_XDAI_OLD ? 'deposit' : 'withdraw',
    args: [amount],
    chainId: Chains.gnosis,
    query: {
      enabled: isReady && !returnZero && amount > 0n && !!userAddress,
      retry: false,
    },
  })

  const { writeContractAsync } = useWriteContract()

  return useMemo(() => {
    if (!isReady || isLoading) return undefined
    if (!simulation?.request) return { tx: null }
    return { tx: () => writeContractAsync(simulation.request) }
  }, [isReady, isLoading, simulation, writeContractAsync])
}
