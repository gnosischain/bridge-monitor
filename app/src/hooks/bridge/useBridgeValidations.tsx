import { BigNumber } from 'ethers'
import { Token } from '@/types/token'
import { isAddress } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { MAX_PER_TX, MIN_PER_TX } from '@/src/hooks/bridge/useBridgeInfo'
import { TOKEN_MODE } from '@/src/hooks/bridge/useTokenMode'

export const useBridgeValidations = ({
  accountBalance,
  allowance,
  amount,
  recipient,
  token,
  tokenMode,
}: {
  accountBalance: BigNumber
  amount: BigNumber
  tokenMode?: TOKEN_MODE
  recipient?: string
  allowance?: BigNumber
  token?: Token
}) => {
  // TODO Missing validations here
  const amountIsGreaterThanBalance = amount.gt(accountBalance)
  const amountisLessThanMinPerTx = amount.lt(MIN_PER_TX)
  const amountisGreaterThanMaxPerTx = amount.gt(MAX_PER_TX)
  const isValidAmount = amount.gt(0)

  const isValidToken = !!token

  const shouldApprove =
    (tokenMode === 'ERC20' &&
      allowance &&
      amount &&
      allowance.lt(amount) &&
      !amountIsGreaterThanBalance) ||
    false

  const isValidRecipient = !!recipient && isAddress(recipient)

  const shouldShowErrorMessage = useMemo(
    () => isValidAmount && isValidToken,
    [isValidAmount, isValidToken],
  )

  const errorMessage = useMemo(() => {
    try {
      // disable validation error on first render
      if (!shouldShowErrorMessage) {
        return false
      }
      if (!isValidAmount) {
        throw Error('Please specify amount')
      }
      if (recipient && !isValidRecipient) {
        throw Error('Please specify a valid recipient address')
      }
      if (amountIsGreaterThanBalance) {
        throw Error('Insufficient funds')
      } else if (amountisLessThanMinPerTx) {
        throw Error(`
          The amount is less than current minimum per transaction amount.${' '}
          The minimum per transaction amount is: ${MIN_PER_TX}
        `)
      } else if (amountisGreaterThanMaxPerTx) {
        throw Error(`
          The amount is greater than current maximum per transaction amount.${' '}
          The maximum per transaction amount is: ${MAX_PER_TX.toString()}
        `)
      }
      return false
    } catch (error) {
      return (error as Error).message
    }
  }, [
    shouldShowErrorMessage,
    isValidAmount,
    recipient,
    isValidRecipient,
    amountIsGreaterThanBalance,
    amountisLessThanMinPerTx,
    amountisGreaterThanMaxPerTx,
  ])

  const isValidToSend = !errorMessage && isValidAmount && isValidToken

  return {
    errorMessage,
    shouldApprove,
    isValidToSend,
    isValidAmount,
    isValidToken,
    amountIsGreaterThanBalance,
    amountisLessThanMinPerTx,
    amountisGreaterThanMaxPerTx,
  }
}
