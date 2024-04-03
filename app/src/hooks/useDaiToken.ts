import { Chains } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'

export const useDaiToken = () => {
  const { nativeTokensByNetwork, tokensByAddress } = useBridgedTokens()
  const gnosisXdaiToken = nativeTokensByNetwork[Chains.gnosis]

  const address = gnosisXdaiToken.extensions.bridgeInfo[Chains.mainnet]?.tokenAddress
  if (!address) throw new Error('Dai token address not found')

  const mainnetDaiToken = tokensByAddress[address]

  return { gnosisXdaiToken, mainnetDaiToken } as const
}
