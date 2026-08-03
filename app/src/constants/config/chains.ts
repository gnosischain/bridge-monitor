import nullthrows from 'nullthrows'

import { ChainConfig, Chains, ChainsKeys, ChainsValues } from '@/src/constants/config/types'

// Default chain id from env var
export const INITIAL_APP_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '1',
) as ChainsValues

export const chainsConfig: Record<ChainsValues, ChainConfig> = {
  [Chains.mainnet]: {
    id: Chains.mainnet,
    name: 'Ethereum',
    shortName: 'Ethereum',
    chainId: Chains.mainnet,
    chainIdHex: '0x1',
    blockExplorerUrls: ['https://etherscan.io/'],
    blockExplorerName: 'EtherScan',
    token: 'ETH',
    tokenDecimals: 18,
    bridge: {
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      wForeignNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      USDS: '0xdc035d45d973e3ec169d2276ddab16f1e407384f',
    },
  },
  // [Chains.chiado]: {
  //   id: Chains.chiado,
  //   name: 'Gnosis Chiado Testnet',
  //   shortName: 'Chiado',
  //   chainId: Chains.chiado,
  //   chainIdHex: '0x27d8',
  //   blockExplorerUrls: ['https://gnosis-chiado.blockscout.com/'],
  //   blockExplorerName: 'Chiado Blockscout',
  //   token: 'Testnet xDai on Chiado',
  //   tokenDecimals: 18,
  //   blocksFrequencyInSeconds: 5,
  //   bridge: {
  //     DAI: '',
  //     wForeignNative: '', // WETH
  //   },
  // },
  [Chains.gnosis]: {
    id: Chains.gnosis,
    name: 'Gnosis Chain',
    shortName: 'Gnosis',
    chainId: Chains.gnosis,
    chainIdHex: '0x64',
    blockExplorerUrls: ['https://gnosisscan.io/'],
    blockExplorerName: 'GnosisScan',
    token: 'xDAI',
    tokenDecimals: 18,
    bridge: {
      DAI: '0x44fA8E6f47987339850636F88629646662444217',
      wForeignNative: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', // WETH
    },
  },
}

// function to get ChainKey by chainId
export const getChainKey = (chainId: number) => {
  const key = Object.keys(Chains).find((key) => Chains[key as keyof typeof Chains] === chainId)
  return nullthrows(key, 'Chain not found') as ChainsKeys
}

export function getNetworkConfig(chainId: ChainsValues): ChainConfig {
  const networkConfig = chainsConfig[chainId]
  return nullthrows(networkConfig, `No config for chain id: ${chainId}`)
}

export { Chains }
