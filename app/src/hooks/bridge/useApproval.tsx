import { useCallback } from 'react'

import { type Address, erc20Abi } from 'viem'

import useTransaction from '@/src/hooks/useTransaction'
import { toCall } from '@/src/lib/web3/transactions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

type Approval = {
  tokenAddress: string
  amount: bigint
  spenderAddress: string | null
}

export const useApproval = () => {
  const { address, appChainId } = useWeb3Connection()
  const sendTx = useTransaction()

  return useCallback(
    async ({ amount, spenderAddress = address, tokenAddress }: Approval) => {
      if (!spenderAddress) {
        throw new Error('No spenderAddress found')
      }

      // notification-wrapped ERC20 approve; resolves the tx hash (or null on reject /
      // disconnected wallet). Callers that need to block on the receipt do so with
      // `waitForMinedReceipt(hash, chainId)`.
      return sendTx({
        calls: [
          toCall({
            abi: erc20Abi,
            address: tokenAddress as Address,
            functionName: 'approve',
            args: [spenderAddress as Address, amount],
          }),
        ],
        chainId: appChainId,
      })
    },
    [address, appChainId, sendTx],
  )
}
