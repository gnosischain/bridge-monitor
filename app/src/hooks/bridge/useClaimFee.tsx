import { useGasPrice } from 'wagmi'
import { Chains } from '@/src/constants/config/types'

export const useClaimFee = ({
  isFromHome,
  isNativeBridge,
}: {
  isFromHome: boolean
  isNativeBridge: boolean
}) => {
  const {
    data: gasPrice,
    error,
    isLoading,
  } = useGasPrice({
    chainId: Chains.mainnet,
    query: {
      enabled: isFromHome,
      refetchInterval: 12000,
    },
  })

  const claimGasAmount = isNativeBridge ? 170000n : 270000n
  const data = isFromHome && gasPrice !== undefined ? gasPrice * claimGasAmount : null

  return { data, error, isLoading }
}
