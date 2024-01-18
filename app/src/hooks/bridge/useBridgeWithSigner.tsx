import { BridgeContractKey, contracts } from '@/src/constants/config/contracts'
import { useWeb3ConnectedApp } from '@/src/providers/web3ConnectionProvider'
import {
  ForeignBridgeErcToNative__factory,
  ForeignOmniMediator__factory,
  HomeBridgeErcToNative__factory,
  HomeOmniMediator__factory,
} from '@/types/typechain'
import { useCallback } from 'react'

export const useContractBridgeWithSigner = () => {
  const { appChainId, web3Provider } = useWeb3ConnectedApp()

  return useCallback(
    (bridgeContractKey: BridgeContractKey) => {
      const contractAddress = contracts[bridgeContractKey]?.address[appChainId]

      if (!contractAddress) {
        throw new Error(
          `No bridge contract address found for ${bridgeContractKey} on chain ${appChainId}`,
        )
      }

      switch (bridgeContractKey) {
        case BridgeContractKey.HomeXdaiBridge:
          return HomeBridgeErcToNative__factory.connect(contractAddress, web3Provider.getSigner())
        case BridgeContractKey.ForeignXdaiBridge:
          return ForeignBridgeErcToNative__factory.connect(
            contractAddress,
            web3Provider.getSigner(),
          )
        case BridgeContractKey.HomeOmniBridge:
          return HomeOmniMediator__factory.connect(contractAddress, web3Provider.getSigner())
        case BridgeContractKey.ForeignOmniBridge:
          return ForeignOmniMediator__factory.connect(contractAddress, web3Provider.getSigner())
        default:
          throw new Error(`Unknown bridge contract key ${bridgeContractKey}`)
      }
    },
    [appChainId, web3Provider],
  )
}
