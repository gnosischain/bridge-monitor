import { useCallback } from 'react'

import { type Address, erc20Abi } from 'viem'
import { useWriteContract } from 'wagmi'

import useTransaction from '@/src/hooks/useTransaction'
import { waitForMinedReceipt } from '@/src/lib/web3/transactions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

type Approval = {
  tokenAddress: string
  amount: bigint
  spenderAddress: string | null
}

export const useApproval = () => {
  const { address, appChainId } = useWeb3Connection()
  const { writeContractAsync } = useWriteContract()
  const sendTx = useTransaction()

  return useCallback(
    async ({ amount, spenderAddress = address, tokenAddress }: Approval) => {
      if (!spenderAddress) {
        throw new Error('No spenderAddress found')
      }

      // notification-wrapped ERC20 approve; `sendTx` returns the tx hash (or null on
      // reject / disconnected wallet)
      const hash = await sendTx(() =>
        writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as Address,
          functionName: 'approve',
          args: [spenderAddress as Address, amount],
        }),
      )

      if (!hash) return null

      // keep a `.wait()` handle so callers can block on the receipt (parity with the old
      // ethers ContractTransaction return; throws on revert like ethers' `tx.wait()`)
      return { hash, wait: () => waitForMinedReceipt(hash, appChainId) }
    },
    [address, appChainId, sendTx, writeContractAsync],
  )
}
