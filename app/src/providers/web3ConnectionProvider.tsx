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
import nullthrows from 'nullthrows'
import { useCapabilities, useChainId, useConnection, useSwitchChain } from 'wagmi'

import { INITIAL_APP_CHAIN_ID, chainsConfig } from '@/src/constants/config/chains'
import { Chains, ChainsKeys, ChainsValues } from '@/src/constants/config/types'
import { getSupportedNetworks } from '@/src/utils/getSupportedNetworks'
import { isValidChain } from '@/src/utils/tools'
import { RequiredNonNull } from '@/types/utils'

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
  pushNetwork: (chainId: number) => Promise<boolean>
  setAppChainId: Dispatch<SetStateAction<ChainsValues>>
  walletChainId: number | null
  walletLabel: string | null
  isOnboardChangingChain: boolean
  canBatch: boolean
}

export type Web3Connected = RequiredNonNull<Web3Context>

const Web3ContextConnection = createContext<Web3Context | undefined>(undefined)

type Props = {
  children: ReactNode
}

export default function Web3ConnectionProvider({ children }: Props) {
  const { address: wagmiAddress, connector, isConnected, isConnecting } = useConnection()
  const chainId = useChainId()
  const { isPending: isSwitchingChain, mutateAsync: switchChainAsync } = useSwitchChain()
  const capabilities = useCapabilities({ account: wagmiAddress })

  const [appChainId, setAppChainId] = useState(INITIAL_APP_CHAIN_ID)

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

  const handleDisconnectWallet = async () => {
    connector?.disconnect()
  }

  const handleConnectWallet = useCallback(() => {
    // Dispatch a custom event that the modal can listen to
    window.dispatchEvent(new CustomEvent('openConnectModal'))
  }, [])

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

  const value = {
    address,
    appChainId,
    connectWallet: handleConnectWallet,
    connectingWallet: isConnecting,
    disconnectWallet: handleDisconnectWallet,
    getExplorerUrl,
    isAppConnected,
    isOnboardChangingChain: isSwitchingChain,
    isWalletConnected,
    isWalletNetworkSupported,
    pushNetwork,
    setAppChainId,
    walletChainId,
    walletLabel: connector?.name ?? null,
    canBatch:
      capabilities?.data?.[chainId ?? 0]?.atomic?.status === 'supported' ||
      capabilities?.data?.[chainId ?? 0]?.atomic?.status === 'ready',
  }

  return <Web3ContextConnection.Provider value={value}>{children}</Web3ContextConnection.Provider>
}

export function useWeb3Connection() {
  const context = useContext(Web3ContextConnection)
  if (context === undefined) {
    throw new Error('useWeb3Connection must be used within a Web3ConnectionProvider')
  }
  return context
}

export function useWeb3ConnectedApp() {
  const context = useWeb3Connection()
  if (!context.isAppConnected) {
    throw new Error('useWeb3ConnectedApp must be used within a connected context')
  }
  return context as Web3Connected
}
