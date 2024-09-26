import { BigNumber } from 'ethers'
import { Chains } from '@/src/constants/config/types'
import useSWR from 'swr'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { chainsConfig } from '@/src/constants/config/chains'

export const useClaimFee = ({
  isFromHome,
  isNativeBridge,
}: {
  isFromHome: boolean
  isNativeBridge: boolean
}) => {
  return useSWR(
    ['claimFee', isFromHome, isNativeBridge],
    async () => {
      if (!isFromHome) {
        return null
      }

      const ethRpcProvider = new JsonRpcBatchProvider(chainsConfig[Chains.mainnet].rpcUrl)
      const claimGasAmount = isNativeBridge ? BigNumber.from(170000) : BigNumber.from(270000)
      const gasPrice = await ethRpcProvider.getGasPrice()
      const ethFee = gasPrice.mul(claimGasAmount)
      return ethFee
    },
    {
      refreshInterval: 12000,
      revalidateOnFocus: true,
    },
  )
}
