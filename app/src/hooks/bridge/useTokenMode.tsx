import { chainsConfig } from '@/src/constants/config/chains'
import { ChainsValues } from '@/src/constants/config/types'
import { EURCe_GNOSIS } from '@/src/constants/misc'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { TokenOverrideManager } from '@/src/utils/token-overrides'
import { Token } from '@/types/token'
import { HomeOmniMediator__factory } from '@/types/typechain'
import useSWR from 'swr/immutable'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { contracts } from '@/src/constants/config/contracts'
import { isSameString } from '@/src/utils/tools'
import { zeroAddress } from 'viem'

// This hook is used to determine what kind of token is being used in the bridge.
// Depends on the result we can detect what method we should use to transfer the token to the bridge contract.
// if the token is ERC677/ERC827 we should use the transferAndCall method (we don't need approve here).
// we need this only for omni bridge.
export type TOKEN_MODE = 'ERC20' | 'ERC677' | 'D-ERC20'

export const useTokenMode = (fromChainId: ChainsValues, toChainId: ChainsValues, token: Token) => {
  const { foreignChainId, isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress: token?.address || '',
  })

  const shouldFetch = !isNativeToken && token?.address && foreignChainId && !isNativeBridge

  // TODO: maybe we need the overrides here. Check in omni-ui/packages/dapp/src/lib/overrides.js
  const { data, error, isLoading, mutate } = useSWR<TOKEN_MODE>(
    shouldFetch ? ['tokenMode', token] : null,
    async ([, _token]) => {
      try {
        if (isSameString(_token.address, EURCe_GNOSIS)) {
          return 'ERC20'
        }

        const omniBridge = HomeOmniMediator__factory.connect(
          contracts.OmniBridge.address[fromChainId],
          new JsonRpcBatchProvider(chainsConfig[fromChainId].rpcUrl),
        )

        const nativeTokenAddress = await omniBridge.nativeTokenAddress(_token.address)

        // override token mode
        if (TokenOverrideManager.isOverridden(_token.address)) {
          return TokenOverrideManager.getOverride(_token.address).mode
        }

        if (nativeTokenAddress !== zeroAddress) {
          return 'ERC677'
        }

        return 'ERC20'
      } catch (error) {
        console.error(error)
        return 'ERC20'
      }
    },
  )

  return { data: data || 'ERC20', error, mutate, isLoading }
}
