import { Chains } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'

export const useDaiToken = () => {
  const { nativeTokensByNetwork } = useBridgedTokens()

  return { gnosisXdaiToken: nativeTokensByNetwork[Chains.gnosis] } as const
}
