import { chainsConfig, getNetworkConfig } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { JsonRpcBatchProvider } from '@ethersproject/providers'

import {
  ForeignBridgeErcToNative__factory,
  ForeignOmniMediator__factory,
  HomeBridgeErcToNative__factory,
  HomeOmniMediator__factory,
  NativeOmniBridgeMediator__factory,
  OmniBridgeFeeManager__factory,
} from '@/types/typechain'
import { useCallback } from 'react'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'

export const useBridgeContracts = () => {
  const { readOnlyAppProvider, web3Provider } = useWeb3Connection()

  const bridgeContracts = useCallback((chainId: ChainsValues) => {
    const homeChainConfig = getNetworkConfig(Chains.gnosis)
    const isHome = chainId === Chains.gnosis
    const homeRpcProvider = new JsonRpcBatchProvider(homeChainConfig.rpcUrl)
    const provider = new JsonRpcBatchProvider(chainsConfig[chainId].rpcUrl)
    return {
      // xDAIBrdige
      XDAIBridge: (isHome
        ? HomeBridgeErcToNative__factory
        : ForeignBridgeErcToNative__factory
      ).connect(contracts.XDAIBridge.address[chainId], provider),

      // OmniBridge
      OmniBridge: (isHome ? HomeOmniMediator__factory : ForeignOmniMediator__factory).connect(
        contracts.OmniBridge.address[chainId],
        provider,
      ),

      // OmniBridge mediator for native token -> only used in the foreign chain
      OmniBridgeNativeToken: !isHome
        ? NativeOmniBridgeMediator__factory.connect(
            contracts.omniBridgeNativeToken.address[chainId],
            provider,
          )
        : null,

      // Fee Manager -> only used in the home chain
      omniFeeManager: OmniBridgeFeeManager__factory.connect(
        contracts.omnibridgeFeeManager.address[Chains.gnosis],
        homeRpcProvider,
      ),
    }
  }, [])

  const getFromBridgeWithSigner = useCallback(
    (fromChainId: ChainsValues, toChainId: ChainsValues, tokenAddress: string) => {
      const signer = web3Provider?.getSigner() || readOnlyAppProvider
      const isHome = fromChainId === Chains.gnosis

      const { isNativeBridge, isNativeToken } = getBridgeCommonInfo({
        fromChainId,
        toChainId,
        tokenAddress,
      })

      if (isNativeBridge) {
        return (
          isHome ? HomeBridgeErcToNative__factory : ForeignBridgeErcToNative__factory
        ).connect(contracts.XDAIBridge.address[fromChainId], signer)
      } else if (fromChainId !== Chains.gnosis && isNativeToken) {
        return NativeOmniBridgeMediator__factory.connect(
          contracts.omniBridgeNativeToken.address[fromChainId],
          signer,
        )
      } else {
        return (isHome ? HomeOmniMediator__factory : ForeignOmniMediator__factory).connect(
          contracts.OmniBridge.address[fromChainId],
          signer,
        )
      }
    },
    [readOnlyAppProvider, web3Provider],
  )

  return { bridgeContracts, getFromBridgeWithSigner }
}
