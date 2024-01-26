import useTransaction from '@/src/hooks/useTransaction'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ERC20__factory } from '@/types/typechain/factories/ERC20__factory'
import { BigNumberish } from 'ethers'
import { useCallback } from 'react'

type Approval = {
  tokenAddress: string
  amount: BigNumberish
  spenderAddress: string | null
  infinite?: boolean
}

export const useApproval = () => {
  const { address, web3Provider } = useWeb3Connection()
  const sendTx = useTransaction()
  const signer = web3Provider?.getSigner()

  return useCallback(
    async ({ amount, spenderAddress = address, tokenAddress }: Approval) => {
      if (!signer || !spenderAddress) {
        throw new Error('No signer or spenderAddress or tokenAddress found')
      }
      const erc20 = ERC20__factory.connect(tokenAddress, signer)
      const approve = () => erc20.approve(spenderAddress, amount)
      try {
        return sendTx(approve)
      } catch (e) {
        console.error(e)
      }
    },
    [address, sendTx, signer],
  )
}
