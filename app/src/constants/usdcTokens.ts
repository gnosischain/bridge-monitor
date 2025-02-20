import { USDC_ETHEREUM, USDC_XDAI_OLD, USDCe_GNOSIS } from '@/src/constants/misc'
import { Chains } from '@/src/constants/config/types'
import { Token } from '@/types/token'

export const usdcTokens: Record<string, Token> = {
  usdcXdaiOld: {
    address: USDC_XDAI_OLD,
    chainId: Chains.gnosis,
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
    name: 'USDC on xDAI (old USDC)',
    symbol: 'USDC (old)',
    extensions: {
      bridgeInfo: {
        1: { tokenAddress: USDC_ETHEREUM },
        100: { tokenAddress: USDC_XDAI_OLD },
      },
    },
  },
  usdceGnosis: {
    address: USDCe_GNOSIS,
    chainId: Chains.gnosis,
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
    name: 'USDC.e',
    symbol: 'USDC.e',
    extensions: {
      bridgeInfo: {
        1: { tokenAddress: '' },
        100: { tokenAddress: USDCe_GNOSIS },
      },
    },
  },
  usdcMainnet: {
    address: USDC_ETHEREUM,
    chainId: Chains.mainnet,
    decimals: 6,
    extensions: {
      bridgeInfo: {
        1: { tokenAddress: USDC_ETHEREUM },
        100: { tokenAddress: USDC_XDAI_OLD },
      },
    },
    name: 'USDC',
    symbol: 'USDC',
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
  },
}
