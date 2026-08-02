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
import {
  useCapabilities,
  useConnection,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
} from 'wagmi'
import { useQuery } from '@tanstack/react-query'

import { INITIAL_APP_CHAIN_ID, chainsConfig } from '@/src/constants/config/chains'
import { Chains, ChainsKeys, ChainsValues } from '@/src/constants/config/types'
import { getSupportedNetworks } from '@/src/utils/getSupportedNetworks'
import { isValidChain } from '@/src/utils/tools'
import { Modal } from '@/src/components/modal'
import { SelectWallet } from '@/src/components/wallet/SelectWallet'
import { notify } from '@/src/components/toast'
import { ToastStates } from '@/src/constants/types'

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
  disconnectWallet: () => void
  getExplorerUrl: (hash: string, network?: ChainsKeys) => string
  isAppConnected: boolean
  isWalletConnected: boolean
  isWalletNetworkSupported: boolean
  isSCWallet: boolean | undefined
  canBatch: boolean
  pushNetwork: (chainId: number) => Promise<boolean>
  setAppChainId: Dispatch<SetStateAction<ChainsValues>>
  walletChainId: number | null
  walletLabel: string | null
  isOnboardChangingChain: boolean
}

const Web3ContextConnection = createContext<Web3Context | undefined>(undefined)

type Props = {
  children: ReactNode
}

export default function Web3ConnectionProvider({ children }: Props) {
  const { address: wagmiAddress, chainId, connector, isConnected, isConnecting } = useConnection()
  const { isPending: isSwitchingChain, mutateAsync: switchChainAsync } = useSwitchChain()
  const { mutate: disconnect } = useDisconnect({
    mutation: { onError: (error) => console.error('Failed to disconnect wallet:', error) },
  })

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

  // EIP-5792 capability probe. Drives whether writes are dispatched via `wallet_sendCalls`
  // (smart accounts) vs a plain `sendTransaction` (EOAs) — see `useTransaction`. Two shapes are
  // checked: the standard `atomic.status` and the non-standard `atomicBatch.supported` still emitted
  // by the Safe Apps provider.
  const { data: capabilities } = useCapabilities({
    account: wagmiAddress,
    query: { enabled: !!wagmiAddress },
  })
  const chainCapabilities = chainId ? capabilities?.[chainId] : undefined
  const canBatch =
    chainCapabilities?.atomic?.status === 'supported' ||
    (chainCapabilities as { atomicBatch?: { supported?: boolean } } | undefined)?.atomicBatch
      ?.supported === true

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

  const handleDisconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const pushNetwork = useCallback(
    async (targetChainId: number): Promise<boolean> => {
      try {
        await switchChainAsync({ chainId: targetChainId })
        return true
      } catch (error) {
        console.error('Failed to switch network:', error)
        const targetName = chainsConfig[targetChainId as ChainsValues]?.name
        notify({
          type: ToastStates.failed,
          message: targetName
            ? `Couldn't switch network automatically. Please switch to ${targetName} in your wallet.`
            : `Couldn't switch network automatically. Please switch manually in your wallet.`,
          id: 'switchNetwork',
        })
        return false
      }
    },
    [switchChainAsync],
  )

  const value: Web3Context = {
    address,
    appChainId,
    canBatch,
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
