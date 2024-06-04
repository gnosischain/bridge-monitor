import { USDC_XDAI_OLD, USDCe_GNOSIS } from '@/src/constants/misc'
import { Chains } from '@/src/constants/config/types'

export const usdcTokens = {
  usdcXdaiOld: {
    address: USDC_XDAI_OLD,
    chainId: Chains.gnosis,
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
    name: 'USDC on xDAI (old USDC)',
    symbol: 'USDC (old)',
  },
  usdceGnosis: {
    address: USDCe_GNOSIS,
    chainId: Chains.gnosis,
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
    name: 'USDC.e',
    symbol: 'USDC.e',
  },
}
