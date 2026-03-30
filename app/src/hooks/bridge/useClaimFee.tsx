import { Chains } from '@/src/constants/config/types'
import { useGasPrice } from 'wagmi'

export const useClaimFee = ({
  isFromHome,
  isNativeBridge,
}: {
  isFromHome: boolean
  isNativeBridge: boolean
}) => {
  const claimGasAmount = isNativeBridge ? 170000n : 270000n

  const { data: gasPrice, isLoading } = useGasPrice({
    chainId: Chains.mainnet,
    query: { enabled: isFromHome, refetchInterval: 12000 },
  })

  return {
    data: gasPrice != null ? gasPrice * claimGasAmount : null,
    isLoading,
  }
}
