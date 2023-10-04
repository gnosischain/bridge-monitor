import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { utils } from 'ethers'

export const fromBN = (value?: BigNumberish, valueScale = 18) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined
  }
  return utils.formatUnits(BigNumber.from(value), valueScale)
}

export const fromBNtoNumber = (value?: BigNumberish, valueScale = 18): number | undefined => {
  const bn = fromBN(value, valueScale)
  return bn ? parseFloat(bn) : undefined
}

// TODO: these were added to reuse the current `fromBNtoNumber` implementation
//  but certainly this whole file needs a refactor
/**
 * Curried function to easily format numbers with a predefined decimal's amount
 * @param decimals
 * @returns function (value?: BigNumberish) =>  number | undefined
 */
export const toNumber = (decimals: number) => (value?: BigNumberish) =>
  fromBNtoNumber(value, decimals)

/**
 * Formats a number with 18 decimals
 */
export const fromWei = toNumber(18)
