import { useCallback } from 'react'

import { type Address, erc20Abi } from 'viem'
import { useWriteContract } from 'wagmi'

import useTransaction from '@/src/hooks/useTransaction'
import { waitForTransactionReceipt } from '@/src/lib/web3/transactions'
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
          chainId: appChainId,
        }),
      )

      if (!hash) return null

      // keep a `.wait()` handle so callers can block on the receipt (parity with the old
      // ethers ContractTransaction return). Like ethers' `tx.wait()`, it throws on a
      // reverted tx — viem resolves with `status: 'reverted'` instead, which callers
      // (e.g. the bridgeWithSteps Approve step) would otherwise mistake for success.
      return {
        hash,
        wait: async () => {
          const receipt = await waitForTransactionReceipt(hash, appChainId)
          if (receipt.status === 'reverted') {
            throw new Error(`Approve transaction reverted: ${hash}`)
          }
          return receipt
        },
      }
    },
    [address, appChainId, sendTx, writeContractAsync],
  )
}
