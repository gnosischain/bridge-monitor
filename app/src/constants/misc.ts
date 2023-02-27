import { BigNumber } from '@ethersproject/bignumber'
// ETHERS/BIGNUMBER CONSTANTS
export const ZERO_BN = BigNumber.from(0)
export const ONE_BN = BigNumber.from(1)
export const TWO_BN = BigNumber.from(2)
export const MAX_UINT_256 = TWO_BN.pow(256).sub(1)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DEFAULT_DECIMALS = 2

export const POLLING_INTERVAL = parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL || '10000')

export const ITEMS_PER_PAGE = 50

export const DEBOUNCE_TIME = 1000

export const XDAI_SIGNATURE_THRESHOLD = 4
export const AMB_SIGNATURE_THRESHOLD = 4
