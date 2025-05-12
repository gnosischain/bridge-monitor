import { Token } from '@/types/token'
import { getIcon } from '@/src/utils/icons'
import { NATIVE_TOKEN_ADDRESS, USDS_ADDRESS } from '@/src/constants/config/common'

export const xdaiToken: Token = {
  chainId: 100,
  address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  decimals: 6,
  logoURI: getIcon('xdai'),
  name: 'xDAI',
  symbol: 'xDAI',
  extensions: {
    bridgeInfo: {
      1: { tokenAddress: USDS_ADDRESS },
      100: { tokenAddress: NATIVE_TOKEN_ADDRESS },
    },
  },
}
