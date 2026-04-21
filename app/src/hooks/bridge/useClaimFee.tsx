import { Chains } from '@/src/constants/config/types'
import useSWR from 'swr'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { chainsConfig } from '@/src/constants/config/chains'
import { bnToBigInt } from '@/src/utils/bigNumber'

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
      const claimGasAmount = isNativeBridge ? 170000n : 270000n
      const gasPrice = await ethRpcProvider.getGasPrice().then(bnToBigInt)
      const ethFee = gasPrice * claimGasAmount
      return ethFee
    },
    {
      refreshInterval: 12000,
      revalidateOnFocus: true,
    },
  )
}
