import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { isHexString } from '@ethersproject/bytes'

export const truncateStringInTheMiddle = (
  str: string,
  strPositionStart: number,
  strPositionEnd: number,
) => {
  const minTruncatedLength = strPositionStart + strPositionEnd
  if (minTruncatedLength < str.length) {
    return `${str.substr(0, strPositionStart)}...${str.substr(
      str.length - strPositionEnd,
      str.length,
    )}`
  }
  return str
}

export const hexToNumber = (hex?: string) => (hex ? parseInt(hex || '0', 16) : null)

export const shortenAddress = (address: string, first = 6, last = 4): string => {
  return address ? `${address.slice(0, first)}...${address.slice(-last)}` : address
}

export function isSameString(a: string, b: string): boolean {
  return a.toLowerCase() == b.toLowerCase()
}

export function isValidChain(chain?: ChainsValues | number): chain is ChainsValues {
  return Object.values(Chains).includes(chain as ChainsValues)
}

export const isTransactionHash = (hash: string) => isHexString(hash) && hash.length === 66

export const isNativeToken = (address: string) => {
  return isSameString(address, NATIVE_TOKEN_ADDRESS)
}
