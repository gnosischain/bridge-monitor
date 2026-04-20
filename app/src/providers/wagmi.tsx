import { createConfig, http } from 'wagmi'
import { gnosis, mainnet } from 'wagmi/chains'
import { injected, safe, walletConnect } from 'wagmi/connectors'
import { WALLET_CONNECT_PROJECT_ID } from '@/src/constants/config/common'

export const wagmiConfig = createConfig({
  chains: [mainnet, gnosis],
  connectors: [injected(), walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }), safe()],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [gnosis.id]: http('https://rpc.gnosischain.com/'),
  },
})
