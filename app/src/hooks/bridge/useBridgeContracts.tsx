import { type Abi } from 'viem'

import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { TokenOverrideManager } from '@/src/utils/token-overrides'

/**
 * The `{ address, abi, chainId }` a contract read/write (`readContract` / `writeContract` /
 * `estimateContractGas`) needs to talk to a bridge. `getBridgeContractConfig` resolves the right
 * bridge for a given token and direction: the xDAI native bridge, the native-token mediator, or
 * the OmniBridge mediator (honouring any per-token mediator override).
 */
export type BridgeContractConfig = {
  address: string
  abi: Abi
  chainId: ChainsValues
}

export const getBridgeContractConfig = (
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
  tokenAddress: string,
): BridgeContractConfig => {
  const { isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })

  if (isNativeBridge) {
    return fromChainId === Chains.gnosis
      ? { ...contracts.XDAIBridge[Chains.gnosis], chainId: fromChainId }
      : { ...contracts.BridgeRouter[Chains.mainnet], chainId: fromChainId }
  }

  if (fromChainId !== Chains.gnosis && isNativeToken) {
    return { ...contracts.omniBridgeNativeToken[Chains.mainnet], chainId: fromChainId }
  }

  const omniBridge = contracts.OmniBridge[fromChainId]

  return {
    ...omniBridge,
    address: TokenOverrideManager.isMediatorOverridden(tokenAddress, fromChainId)
      ? TokenOverrideManager.getOverride(tokenAddress).mediator // use the overridden mediator
      : omniBridge.address,
    chainId: fromChainId,
  }
}
