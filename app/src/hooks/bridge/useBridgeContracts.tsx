import { chainsConfig } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { type Abi } from 'viem'

import {
  ForeignBridgeRouter__factory,
  ForeignOmniMediator__factory,
  HomeBridgeErcToNative__factory,
  HomeOmniMediator__factory,
  NativeOmniBridgeMediator__factory,
} from '@/types/typechain'

// the two write-path ABIs not already exposed through `contracts` (BridgeRouter has no
// abi field; the OmniBridge entry carries only the Home mediator abi)
import ForeignBridgeRouter_abi from '@/src/abis/ForeignBridgeRouter.json'
import ForeignOmniMediator_abi from '@/src/abis/ForeignOmniMediator.json'

import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { TokenOverrideManager } from '@/src/utils/token-overrides'

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
    if (isHome) {
      return HomeBridgeErcToNative__factory.connect(
        contracts.XDAIBridge.address[fromChainId],
        provider,
      )
    } else {
      return ForeignBridgeRouter__factory.connect(
        contracts.BridgeRouter.address[fromChainId],
        provider,
      )
    }
  } else if (fromChainId !== Chains.gnosis && isNativeToken) {
    return NativeOmniBridgeMediator__factory.connect(
      contracts.omniBridgeNativeToken.address[fromChainId],
      provider,
    )
  } else {
    return (isHome ? HomeOmniMediator__factory : ForeignOmniMediator__factory).connect(
      TokenOverrideManager.isMediatorOverridden(tokenAddress, fromChainId)
        ? TokenOverrideManager.getOverride(tokenAddress).mediator // use the overridden mediator
        : contracts.OmniBridge.address[fromChainId],
      provider,
    )
  }
}

/**
 * Bridge-contract descriptor for the viem/wagmi write path — the `{ address, abi, chainId }`
 * replacement for the ethers typechain instance above. Introduced with PR 11 (`useApproval` /
 * `ApproveButton`); the remaining typechain callers migrate to it one-by-one through PR 14b,
 * after which `getBridgeContract` is removed. Mirrors that function's bridge-selection branching.
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
          abi: ForeignBridgeRouter_abi as Abi,
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
