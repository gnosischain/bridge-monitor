import useTransaction from '@/src/hooks/useTransaction'
import { useWeb3ConnectedApp } from '@/src/providers/web3ConnectionProvider'
import { ERC20__factory } from '@/types/typechain/factories/ERC20__factory'
import { BigNumberish } from 'ethers'
import { useCallback } from 'react'

type Approval = {
  tokenAddress: string
  spenderAddress: string
  amount: BigNumberish
  infinite?: boolean
}

export const useApproval = () => {
  const { address, web3Provider } = useWeb3ConnectedApp()
  const sendTx = useTransaction()
  const signer = web3Provider.getSigner()

  if (!signer) {
    throw new Error('No signer found')
  }

  return useCallback(
    async ({ amount, spenderAddress = address, tokenAddress }: Approval) => {
      const erc20 = ERC20__factory.connect(tokenAddress, signer)
      const approve = () => erc20.approve(spenderAddress, amount)
      return sendTx(approve)
    },
    [address, sendTx, signer],
  )
}
