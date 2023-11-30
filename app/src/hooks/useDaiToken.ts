import { Chains } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/TokenListProvider'

export const useDaiToken = () => {
  const { nativeTokensByNetwork, tokensByAddress } = useBridgedTokens()
  const gnosisXdaiToken = nativeTokensByNetwork[Chains.gnosis]
  const mainnetDaiToken =
    tokensByAddress[gnosisXdaiToken.extensions.bridgeInfo[Chains.mainnet].tokenAddress]

  return { gnosisXdaiToken, mainnetDaiToken } as const
}
