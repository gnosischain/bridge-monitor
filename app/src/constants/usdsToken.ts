import { Token } from '@/types/token'
import { getIcon } from '@/src/utils/icons'
import { NATIVE_TOKEN_ADDRESS, USDS_ADDRESS } from '@/src/constants/config/common'

export const usdsToken: Token = {
  chainId: 1,
  address: USDS_ADDRESS,
  decimals: 18,
  logoURI: getIcon('usds'),
  name: 'USDS',
  symbol: 'USDS',
  extensions: {
    bridgeInfo: {
      1: { tokenAddress: USDS_ADDRESS },
      100: { tokenAddress: NATIVE_TOKEN_ADDRESS },
    },
  },
}
