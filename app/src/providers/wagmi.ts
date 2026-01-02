import { createConfig, http } from 'wagmi'
import { gnosis, mainnet } from 'wagmi/chains'

export const wagmiConfig = createConfig({
  chains: [mainnet, gnosis],
  connectors: [],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [gnosis.id]: http('https://rpc.gnosischain.com/'),
  },
})
