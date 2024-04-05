import { BigNumber } from '@ethersproject/bignumber'
// ETHERS/BIGNUMBER CONSTANTS
export const ZERO_BN = BigNumber.from(0)
export const ONE_BN = BigNumber.from(1)
export const TWO_BN = BigNumber.from(2)
export const MAX_UINT_256 = TWO_BN.pow(256).sub(1)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const WXDAI_GNOSIS = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
export const sDAI_GNOSIS = '0xaf204776c7245bf4147c2612bf6e5972ee483701'

export const EURe_GNOSIS = '0xcB444e90D8198415266c6a2724b7900fb12FC56E'
export const EURe_ETHEREUM = '0x3231cb76718cdef2155fc47b5286d82e6eda273f'

export const DEFAULT_DECIMALS = 2

export const POLLING_INTERVAL = parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL || '10000')

export const DEBOUNCE_TIME = 500

export const XDAI_SIGNATURE_THRESHOLD = 4
export const AMB_SIGNATURE_THRESHOLD = 4

export const MAX_DAYS_TO_FILTER = 1
