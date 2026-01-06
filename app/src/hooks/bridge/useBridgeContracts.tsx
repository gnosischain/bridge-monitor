import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'

import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { TokenOverrideManager } from '@/src/utils/token-overrides'

export const getBridgeContractAddress = (
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
  tokenAddress: string,
) => {
  const isHome = fromChainId === Chains.gnosis

  const { isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })

  if (isNativeBridge) {
    if (isHome) {
      return contracts.XDAIBridge.address[fromChainId]
    } else {
      return contracts.BridgeRouter.address[fromChainId]
    }
  } else if (fromChainId !== Chains.gnosis && isNativeToken) {
    return contracts.omniBridgeNativeToken.address[fromChainId]
  } else {
    return TokenOverrideManager.isMediatorOverridden(tokenAddress, fromChainId)
      ? TokenOverrideManager.getOverride(tokenAddress).mediator // use the overridden mediator
      : contracts.OmniBridge.address[fromChainId]
  }
}
