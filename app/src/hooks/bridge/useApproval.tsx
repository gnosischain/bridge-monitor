import { TransactionCall, useTransaction } from '@/src/hooks/useTransaction'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ERC20__factory } from '@/types/typechain/factories/ERC20__factory'
import { useCallback } from 'react'
import { encodeFunctionData } from 'viem'

type Approval = {
  tokenAddress: string
  amount: bigint
  spenderAddress: string | null
  infinite?: boolean
}

const buildApproveCall = (
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint,
): TransactionCall => {
  const callData = encodeFunctionData({
    abi: ERC20__factory.abi,
    functionName: 'approve',
    args: [spenderAddress as `0x${string}`, amount],
  })
  return {
    to: tokenAddress as `0x${string}`,
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
