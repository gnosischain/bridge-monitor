/**
 * Number formatting, trimmed from @uniswap/conedison v1.6.0
 * (https://github.com/Uniswap/conedison). Only the rule sets the app uses are kept.
 */

import { Nullish } from '@/types/utils'

const THREE_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
})

const TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const TWO_DECIMALS_USD = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
})

const SHORTHAND_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type Format = Intl.NumberFormat | string

// each rule must contain either an `upperBound` or an `exact` value.
// upperBound => number will use that formatter as long as it is < upperBound
// exact => number will use that formatter if it is === exact
type FormatterRule =
  | { upperBound?: undefined; exact: number; formatter: Format }
  | { upperBound: number; exact?: undefined; formatter: Format }

// these formatter objects dictate which formatter rule to use based on the interval that
// the number falls into. for example, based on the rule set below, if your number
// falls between 1 and 1e6, you'd use TWO_DECIMALS as the formatter.
const tokenNonTxFormatter: FormatterRule[] = [
  { exact: 0, formatter: '0' },
  { upperBound: 0.001, formatter: '<0.001' },
  { upperBound: 1, formatter: THREE_DECIMALS },
  { upperBound: 1e6, formatter: TWO_DECIMALS },
  { upperBound: 1e15, formatter: SHORTHAND_TWO_DECIMALS },
  { upperBound: Infinity, formatter: '>999T' },
]

const portfolioBalanceFormatter: FormatterRule[] = [
  { exact: 0, formatter: '$0.00' },
  { upperBound: Infinity, formatter: TWO_DECIMALS_USD },
]

export enum NumberType {
  // used for token quantities in non-transaction contexts (e.g. portfolio balances)
  TokenNonTx = 'token-non-tx',

  // portfolio balance
  PortfolioBalance = 'portfolio-balance',
}

const TYPE_TO_FORMATTER_RULES = {
  [NumberType.TokenNonTx]: tokenNonTxFormatter,
  [NumberType.PortfolioBalance]: portfolioBalanceFormatter,
}

function getFormatterRule(input: number, type: NumberType) {
  const rules = TYPE_TO_FORMATTER_RULES[type]
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (
      (rule.exact !== undefined && input === rule.exact) ||
      (rule.upperBound !== undefined && input < rule.upperBound)
    ) {
      return rule.formatter
    }
  }

  throw new Error(`formatter for type ${type} not configured correctly`)
}

// @todo: rework to accept bigint and do range comparisons directly on bigint, removing the parseFloat dependency
export function formatNumber(
  input: Nullish<number>,
  type: NumberType = NumberType.TokenNonTx,
  placeholder = '-',
) {
  if (input === null || input === undefined) {
    return placeholder
  }

  const formatter = getFormatterRule(input, type)
  if (typeof formatter === 'string') return formatter
  return formatter.format(input)
}
