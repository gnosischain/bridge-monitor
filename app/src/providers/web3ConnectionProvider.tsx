'use client'

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { JsonRpcProvider } from '@ethersproject/providers'
import type { providers } from 'ethers'
import nullthrows from 'nullthrows'
import { useConnection, useConnectorClient, usePublicClient, useSwitchChain } from 'wagmi'
import { useQuery } from '@tanstack/react-query'

import { INITIAL_APP_CHAIN_ID, chainsConfig, getNetworkConfig } from '@/src/constants/config/chains'
import { Chains, ChainsKeys, ChainsValues } from '@/src/constants/config/types'
import { getSupportedNetworks } from '@/src/utils/getSupportedNetworks'
import { isValidChain } from '@/src/utils/tools'
import { Modal } from '@/src/components/modal'
import { SelectWallet } from '@/src/components/wallet/SelectWallet'
import { clientToWeb3Provider } from '@/src/utils/ethersAdapters'

// Default chain id from env var
nullthrows(
  Object.values(Chains).includes(INITIAL_APP_CHAIN_ID) ? INITIAL_APP_CHAIN_ID : null,
  'No default chain ID is defined or is not supported',
)

export type Web3Context = {
  address: `0x${string}` | null
  appChainId: ChainsValues
  connectWallet: () => void
  connectingWallet: boolean
  disconnectWallet: () => Promise<void>
  getExplorerUrl: (hash: string, network?: ChainsKeys) => string
  isAppConnected: boolean
  isWalletConnected: boolean
  isWalletNetworkSupported: boolean
  isSCWallet: boolean | undefined
  pushNetwork: (chainId: number) => Promise<boolean>
  setAppChainId: Dispatch<SetStateAction<ChainsValues>>
  walletChainId: number | null
  walletLabel: string | null
  isOnboardChangingChain: boolean
  readOnlyAppProvider: JsonRpcProvider
  web3Provider: providers.Web3Provider | null
}

const Web3ContextConnection = createContext<Web3Context | undefined>(undefined)

type Props = {
  children: ReactNode
}

export default function Web3ConnectionProvider({ children }: Props) {
  const { address: wagmiAddress, chainId, connector, isConnected, isConnecting } = useConnection()
  const { data: connectorClient } = useConnectorClient()
  const { isPending: isSwitchingChain, mutateAsync: switchChainAsync } = useSwitchChain()

  const [appChainId, setAppChainId] = useState(INITIAL_APP_CHAIN_ID)
  const [showWalletModal, setShowWalletModal] = useState(false)

  const walletPublicClient = usePublicClient({ chainId })
  const { data: isSCWallet } = useQuery({
    queryKey: ['isSCWallet', wagmiAddress, chainId],
    queryFn: async () => {
      if (!walletPublicClient || !wagmiAddress) return false
      const code = await walletPublicClient.getCode({ address: wagmiAddress })
      if (!code) return false
      // EIP-7702: an EOA with a delegation has code `0xef0100 || delegate` — still an EOA
      if (code.toLowerCase().startsWith('0xef0100')) return false
      return true
    },
    enabled: !!wagmiAddress && !!walletPublicClient,
  })

  const address = wagmiAddress ?? null
  const walletChainId = chainId ?? null

  const isWalletConnected = isConnected && address != null
  const isAppConnected = isWalletConnected && walletChainId === appChainId
  const isWalletNetworkSupported = getSupportedNetworks().some(({ id }) => {
    return id === walletChainId
  })

  // Sync app chain with wallet chain when on supported network
  useEffect(() => {
    if (isWalletNetworkSupported && walletChainId) {
      setAppChainId(walletChainId as SetStateAction<ChainsValues>)
    }
  }, [walletChainId, isWalletNetworkSupported])

  // Auto-close wallet modal on successful connection
  useEffect(() => {
    if (isConnected && showWalletModal) {
      setShowWalletModal(false)
    }
  }, [isConnected, showWalletModal])

  const getExplorerUrl = useMemo(() => {
    return (hash: string, network = 'mainnet') => {
      const chain = Object.entries(Chains).find(
        ([key]) => key.toLowerCase() === network.toLowerCase(),
      )

      if (!chain || !isValidChain(chain[1])) {
        throw new Error(`Invalid chain: ${chain}`)
      }

      const url = chainsConfig[chain[1]]?.blockExplorerUrls[0]
      const type = {
        '42': 'address',
        '66': 'tx',
      }[hash?.length]

      if (!type) {
        // assume it's the native token, thus point to the chain explorer homepage
        return url
      }

      return `${url}${type}/${hash}`
    }
  }, [])

  const handleConnectWallet = useCallback(() => {
    setShowWalletModal(true)
  }, [])

  const handleDisconnectWallet = useCallback(async () => {
    connector?.disconnect()
  }, [connector])

  const pushNetwork = useCallback(
    async (targetChainId: number): Promise<boolean> => {
      try {
        await switchChainAsync({ chainId: targetChainId })
        return true
      } catch (error) {
        console.error('Failed to switch network:', error)
        return false
      }
    },
    [switchChainAsync],
  )

  const web3Provider = useMemo(
    () => (connectorClient ? clientToWeb3Provider(connectorClient) : null),
    [connectorClient],
  )

  const readOnlyAppProvider = useMemo(
    () => new JsonRpcProvider(getNetworkConfig(appChainId)?.rpcUrl, appChainId),
    [appChainId],
  )

  const value: Web3Context = {
    address,
    appChainId,
    connectWallet: handleConnectWallet,
    connectingWallet: isConnecting,
    disconnectWallet: handleDisconnectWallet,
    getExplorerUrl,
    isAppConnected,
    isOnboardChangingChain: isSwitchingChain,
    isSCWallet,
    isWalletConnected,
    isWalletNetworkSupported,
    pushNetwork,
    setAppChainId,
    walletChainId,
    walletLabel: connector?.name ?? null,
    readOnlyAppProvider,
    web3Provider,
  }

  return (
    <Web3ContextConnection.Provider value={value}>
      {children}
      {showWalletModal && (
        <Modal onClose={() => setShowWalletModal(false)} size="760px">
          <SelectWallet />
        </Modal>
      )}
    </Web3ContextConnection.Provider>
  )
}

export function useWeb3Connection() {
  const context = useContext(Web3ContextConnection)
  if (context === undefined) {
    throw new Error('useWeb3Connection must be used within a Web3ConnectionProvider')
  }
  return context
}
