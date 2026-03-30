import { useWriteContract } from 'wagmi'
import { Chains } from '@/src/constants/config/types'
import { USDC_XDAI_OLD } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'
import { transmuterContract } from '@/src/constants/config/contracts'

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
  if (walletChainId !== Chains.gnosis) throw new Error('Invalid chain')

  const { mutateAsync } = useWriteContract()

  const functionName = (token.address === USDC_XDAI_OLD ? 'deposit' : 'withdraw') as
    | 'deposit'
    | 'withdraw'
  const enabled = !returnZero && amount > 0n && !!userAddress

  const tx = enabled
    ? () => mutateAsync({ ...transmuterContract, functionName, args: [amount] })
    : null

  return { tx }
}
