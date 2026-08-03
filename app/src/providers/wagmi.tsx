import { createConfig, http } from 'wagmi'
import { gnosis, mainnet } from 'wagmi/chains'
import { injected, safe, walletConnect } from 'wagmi/connectors'
import { WALLET_CONNECT_DAPP_URL, WALLET_CONNECT_PROJECT_ID } from '@/src/constants/config/common'
import { getProviderUrl } from '@/src/constants/config/rpc-providers'
import { Chains } from '@/src/constants/config/types'

const dappUrl = typeof window === 'undefined' ? WALLET_CONNECT_DAPP_URL : window.location.origin

export const wagmiConfig = createConfig({
  chains: [mainnet, gnosis],
  connectors: [
    injected(),
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: 'Gnosis Bridge',
        description: 'Transfer assets between Ethereum and Gnosis Chain',
        url: dappUrl,
        icons: [`${dappUrl}/favicon/android-chrome-192x192.png`],
      },
    }),
    safe(),
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http(getProviderUrl(Chains.mainnet), { batch: true }),
    [gnosis.id]: http(getProviderUrl(Chains.gnosis), { batch: true }),
  },
})
