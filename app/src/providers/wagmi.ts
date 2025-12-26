import { createConfig, http } from 'wagmi'
import { gnosis, mainnet } from 'wagmi/chains'
import { safe } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet, gnosis],
  connectors: [safe()],
  transports: {
    [mainnet.id]: http(),
    [gnosis.id]: http('https://rpc.gnosischain.com/'),
  },
})
