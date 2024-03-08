import { chainsConfig } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { JsonRpcBatchProvider } from '@ethersproject/providers'

import {
  ForeignBridgeErcToNative__factory,
  ForeignOmniMediator__factory,
  HomeBridgeErcToNative__factory,
  HomeOmniMediator__factory,
  NativeOmniBridgeMediator__factory,
} from '@/types/typechain'

import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { getOverridden, isMediatorOverridden } from '@/src/utils/token-overrides'

export const getBridgeContract = (
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
  tokenAddress: string,
) => {
  const isHome = fromChainId === Chains.gnosis
  const provider = new JsonRpcBatchProvider(chainsConfig[fromChainId].rpcUrl)

  const { isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })

  if (isNativeBridge) {
    return (isHome ? HomeBridgeErcToNative__factory : ForeignBridgeErcToNative__factory).connect(
      contracts.XDAIBridge.address[fromChainId],
      provider,
    )
  } else if (fromChainId !== Chains.gnosis && isNativeToken) {
    return NativeOmniBridgeMediator__factory.connect(
      contracts.omniBridgeNativeToken.address[fromChainId],
      provider,
    )
  } else {
    return (isHome ? HomeOmniMediator__factory : ForeignOmniMediator__factory).connect(
      isMediatorOverridden(tokenAddress, fromChainId)
        ? getOverridden(tokenAddress).mediator // use the overridden mediator
        : contracts.OmniBridge.address[fromChainId],
      provider,
    )
  }
}
