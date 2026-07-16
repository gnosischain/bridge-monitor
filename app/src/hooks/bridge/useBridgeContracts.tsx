import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { type Abi } from 'viem'

// the two bridge ABIs not exposed through `contracts` (its BridgeRouter entry has no abi
// field, and its OmniBridge entry carries only the home mediator's abi)
import ForeignBridgeRouter_abi from '@/src/abis/ForeignBridgeRouter'
import ForeignOmniMediator_abi from '@/src/abis/ForeignOmniMediator.json'

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
  const isHome = fromChainId === Chains.gnosis

  const { isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })

  if (isNativeBridge) {
    return isHome
      ? {
          address: contracts.XDAIBridge.address[fromChainId],
          abi: contracts.XDAIBridge.abi as Abi,
          chainId: fromChainId,
        }
      : {
          address: contracts.BridgeRouter.address[fromChainId],
          abi: ForeignBridgeRouter_abi,
          chainId: fromChainId,
        }
  }

  if (fromChainId !== Chains.gnosis && isNativeToken) {
    return {
      address: contracts.omniBridgeNativeToken.address[fromChainId],
      abi: contracts.omniBridgeNativeToken.abi as Abi,
      chainId: fromChainId,
    }
  }

  return {
    address: TokenOverrideManager.isMediatorOverridden(tokenAddress, fromChainId)
      ? TokenOverrideManager.getOverride(tokenAddress).mediator // use the overridden mediator
      : contracts.OmniBridge.address[fromChainId],
    abi: isHome ? (contracts.OmniBridge.abi as Abi) : (ForeignOmniMediator_abi as Abi),
    chainId: fromChainId,
  }
}
