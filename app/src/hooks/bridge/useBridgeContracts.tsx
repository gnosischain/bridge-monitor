import { getNetworkConfig } from '@/src/constants/config/chains'
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
import { useCallback, useMemo } from 'react'

export const useBridgeContracts = (foreignChainId: ChainsValues) => {
  const { web3Provider } = useWeb3Connection()

  const bridgeContracts = useMemo(() => {
    const homeChainConfig = getNetworkConfig(Chains.gnosis)
    const homeRpcProvider = new JsonRpcBatchProvider(homeChainConfig.rpcUrl)
    const foreignChainConfig = getNetworkConfig(foreignChainId)
    const foreignRpcProvider = new JsonRpcBatchProvider(foreignChainConfig.rpcUrl)

    return {
      // xDAIBrdige
      homeNativeBridge: HomeBridgeErcToNative__factory.connect(
        contracts.homeXdaiBridge.address[homeChainConfig.chainId],
        homeRpcProvider,
      ),
      foreignNativeBridge: ForeignBridgeErcToNative__factory.connect(
        contracts.foreignXdaiBridge.address[foreignChainConfig.chainId],
        foreignRpcProvider,
      ),
      // OmniBridge
      homeOmniBridge: HomeOmniMediator__factory.connect(
        contracts.homeOmniBridge.address[homeChainConfig.chainId],
        homeRpcProvider,
      ),
      foreignOmniBridge: ForeignOmniMediator__factory.connect(
        contracts.foreignOmniBridge.address[foreignChainConfig.chainId],
        foreignRpcProvider,
      ),
      nativeOmniBridge: NativeOmniBridgeMediator__factory.connect(
        contracts.nativeOmniBridge.address[foreignChainConfig.chainId],
        foreignRpcProvider,
      ),
      // Fee Manager
      omniFeeManager: OmniBridgeFeeManager__factory.connect(
        contracts.omnibridgeFeeManager.address[homeChainConfig.chainId],
        homeRpcProvider,
      ),
    }
  }, [foreignChainId])

  const getFromBridgeAddress = useCallback(
    (isFromHome: boolean, isNativeBridge: boolean, isNativeToken: boolean) => {
      const {
        foreignNativeBridge,
        foreignOmniBridge,
        homeNativeBridge,
        homeOmniBridge,
        nativeOmniBridge,
      } = bridgeContracts

      let address

      // home -> foreign
      if (isFromHome) {
        if (isNativeBridge) address = homeNativeBridge.address // xDAI -> DAI
        else address = homeOmniBridge.address // ERC20/ERC677 -> ERC20
      } else {
        // foreign -> home
        if (isNativeBridge) address = foreignNativeBridge.address // DAI -> xDAI
        else if (isNativeToken) address = nativeOmniBridge.address // ETH -> WETH
        else address = foreignOmniBridge.address // ERC20 -> ERC20/ERC677
      }

      return address
    },
    [bridgeContracts],
  )

  const getFromBridgeWithSigner = useCallback(
    (isFromHome: boolean, isNativeBridge: boolean, isNativeToken: boolean) => {
      if (!web3Provider) {
        throw new Error('No web3 provider found')
      }

      const signer = web3Provider.getSigner()
      const fromBridgeAddress = getFromBridgeAddress(isFromHome, isNativeBridge, isNativeToken)

      return isFromHome
        ? isNativeBridge
          ? HomeBridgeErcToNative__factory.connect(fromBridgeAddress, signer)
          : HomeOmniMediator__factory.connect(fromBridgeAddress, signer)
        : isNativeBridge
        ? ForeignBridgeErcToNative__factory.connect(fromBridgeAddress, signer)
        : isNativeToken
        ? NativeOmniBridgeMediator__factory.connect(fromBridgeAddress, signer)
        : ForeignOmniMediator__factory.connect(fromBridgeAddress, signer)
    },
    [getFromBridgeAddress, web3Provider],
  )

  return { bridgeContracts, getFromBridgeAddress, getFromBridgeWithSigner }
}
