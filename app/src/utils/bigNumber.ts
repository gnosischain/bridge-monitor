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

const sanitizeAmount = (amount: string, decimals: number) => {
  if (!amount.includes('.')) return amount

  const parts = amount.split('.')
  const decimalPart = parts[1].slice(0, decimals) // Keep only allowed decimal places
  return `${parts[0]}.${decimalPart}`
}

// TODO(wagmi-migration): remove once all typechain contract calls are replaced with
// viem readContract, which returns bigint natively. Usage: `.then(bnToBigInt)`
export const bnToBigInt = (value: { toBigInt(): bigint }): bigint => value.toBigInt()

export const toBN = (amount: string, decimals: number) => {
  // Default to 0 if amount is only a decimal point or is falsy
  if (amount === '.' || !amount) {
    return BigNumber.from(0)
  }

  if (amount.startsWith('.')) {
    amount = `0${amount}` // Prepend 0 to decimal values
  }

  // Ensure decimals is a number; default to 18 if undefined
  const tokenDecimals = decimals !== undefined ? decimals : 18

  // Sanitize amount to ensure it doesn't exceed token decimals
  const sanitizedAmount = sanitizeAmount(amount, tokenDecimals)

  return utils.parseUnits(sanitizedAmount, tokenDecimals)
}
