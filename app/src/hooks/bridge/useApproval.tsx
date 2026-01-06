import { TransactionCall, useTransaction } from '@/src/hooks/useTransaction'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ERC20__factory } from '@/types/typechain/factories/ERC20__factory'
import { useCallback } from 'react'
import { encodeFunctionData } from 'viem'

type Approval = {
  tokenAddress: `0x${string}`
  amount: bigint
  spenderAddress: `0x${string}` | null
  infinite?: boolean
}

const buildApproveCall = (
  tokenAddress: `0x${string}`,
  spenderAddress: `0x${string}`,
  amount: bigint,
): TransactionCall => {
  const callData = encodeFunctionData({
    abi: ERC20__factory.abi,
    functionName: 'approve',
    args: [spenderAddress, amount],
  })
  return {
    to: tokenAddress,
    data: callData,
    title: 'Approve token',
  }
}

export const useApproval = () => {
  const { address } = useWeb3Connection()
  const { execute } = useTransaction()

  return useCallback(
    async ({ amount, spenderAddress = address, tokenAddress }: Approval) => {
      if (!spenderAddress) {
        throw new Error('No spenderAddress or tokenAddress found')
      }
      try {
        return execute([buildApproveCall(tokenAddress, spenderAddress, amount)])
      } catch (e) {
        console.error(e)
      }
    },
    [address, execute],
  )
}
