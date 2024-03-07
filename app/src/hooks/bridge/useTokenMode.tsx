import { Chains, ChainsValues } from '@/src/constants/config/types'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { getOverridden, isOverridden } from '@/src/utils/token-overrides'
import { Token } from '@/types/token'
import useSWR from 'swr/immutable'

// This hook is used to determine what kind of token is being used in the bridge.
// Depends on the result we can detect what method we should use to transfer the token to the bridge contract.
// if the token is ERC677/ERC827 we should use the transferAndCall method (we don't need approve here).
// we need this only for omni bridge.
export type TOKEN_MODE = 'ERC20' | 'ERC677' | 'D-ERC20'

export const useTokenMode = (fromChainId: ChainsValues, toChainId: ChainsValues, token: Token) => {
  const { bridgeContracts } = useBridgeContracts()
  const { foreignChainId, isFromHome, isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress: token?.address || '',
  })

  const shouldFetch = !isNativeToken && token?.address && foreignChainId && !isNativeBridge

  // TODO: maybe we need the overrides here. Check in omni-ui/packages/dapp/src/lib/overrides.js
  const { data, error, isLoading, mutate } = useSWR<TOKEN_MODE>(
    shouldFetch ? [isFromHome, token, 'tokenMode'] : null,
    async ([_isFromHome, _token]) => {
      try {
        const nativeTokenAddress = await bridgeContracts(
          _isFromHome ? Chains.gnosis : foreignChainId,
        ).OmniBridge.nativeTokenAddress(_token.address)

        // override token mode
        if (isOverridden(_token.address)) {
          return getOverridden(_token.address).mode
        }

        if (nativeTokenAddress !== ZERO_ADDRESS) {
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
