import { ChainsValues } from '@/src/constants/config/types'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { Token } from '@/types/token'
import useSWR from 'swr/immutable'

// This hook is used to determine what kind of token is being used in the bridge.
// Depends on the result we can detect what method we should use to transfer the token to the bridge contract.
// if the token is ERC677/ERC827 we should use the transferAndCall method (we don't need approve here).
// we need this only for omni bridge.
export type TOKEN_MODE = 'ERC20' | 'ERC677'

export const useTokenMode = (
  isFromHome: boolean,
  foreignChainId: ChainsValues,
  isNativeBridge: boolean,
  isNativeToken: boolean,
  token?: Token,
) => {
  const { bridgeContracts } = useBridgeContracts(foreignChainId)

  const shouldFetch = !isNativeToken && token?.address && foreignChainId && !isNativeBridge

  // TODO: maybe we need the overrides here. Check in omni-ui/packages/dapp/src/lib/overrides.js
  const { data, error, isLoading, mutate } = useSWR<TOKEN_MODE>(
    shouldFetch ? [isFromHome, token, 'tokenMode'] : null,
    async ([_isFromHome, _token]) => {
      try {
        const nativeTokenAddress = _isFromHome
          ? await bridgeContracts.homeOmniBridge.nativeTokenAddress(_token.address)
          : await bridgeContracts.foreignOmniBridge.nativeTokenAddress(_token.address)

        if (nativeTokenAddress !== ZERO_ADDRESS) {
          return 'ERC677'
        }

        return 'ERC20'
      } catch (error) {
        console.error(error)
        return 'ERC20'
      }
    },
    { suspense: false },
  )

  return { data: data || 'ERC20', error, mutate, isLoading }
}
