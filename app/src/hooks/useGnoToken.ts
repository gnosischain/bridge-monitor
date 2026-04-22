import { useMemo } from 'react'

import { Chains } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { zeroAddress } from 'viem'

export const useGnoToken = () => {
  const { tokensByNetwork } = useBridgedTokens()
  const mainnetGnoToken = useMemo(
    () => tokensByNetwork[Chains.mainnet].find((token) => isSameString(token.symbol, 'GNO')),
    [tokensByNetwork],
  ) as Token

  const gnosisGnoToken = useMemo(
    () =>
      tokensByNetwork[Chains.gnosis].find((token) =>
        isSameString(
          token.address,
          mainnetGnoToken.extensions.bridgeInfo[Chains.gnosis]?.tokenAddress ?? zeroAddress,
        ),
      ),
    [tokensByNetwork, mainnetGnoToken],
  ) as Token

  return { mainnetGnoToken, gnosisGnoToken } as const
}
