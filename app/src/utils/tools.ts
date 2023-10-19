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
