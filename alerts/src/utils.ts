import { ethers } from "ethers"
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'

const fromBN = (value?: BigNumberish, valueScale = 18) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined
  }
  return ethers.utils.formatUnits(BigNumber.from(value), valueScale)
}

const fromBNtoNumber = (value?: BigNumberish, valueScale = 18): number | undefined => {
  const bn = fromBN(value, valueScale)
  return bn ? parseFloat(bn) : undefined
}

const calculatePercentage = (spent: number, total: number) => {
  return (spent * 100) / total
}

export { fromBN, fromBNtoNumber, calculatePercentage }
