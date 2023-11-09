import { Chains } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenIconsProvider'

export const useDaiToken = () => {
  const { nativeTokensByNetwork, tokensByAddress } = useBridgedTokens()
  const gnosisXdaiToken = nativeTokensByNetwork[Chains.gnosis]
  const mainnetDaiToken =
    tokensByAddress[gnosisXdaiToken.extensions.bridgeInfo[Chains.mainnet].tokenAddress]

  return { gnosisXdaiToken, mainnetDaiToken } as const
}
