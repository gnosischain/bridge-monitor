import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { ethers } from 'ethers'

export const fromBN = (value?: BigNumberish, valueScale = 18) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined
  }
  return ethers.utils.formatUnits(BigNumber.from(value), valueScale)
}

export const fromBNtoNumber = (value?: BigNumberish, valueScale = 18): number | undefined => {
  const bn = fromBN(value, valueScale)
  return bn ? parseFloat(bn) : undefined
}
