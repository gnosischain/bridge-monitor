import { BigNumber } from 'ethers'
import { Token } from '@/types/token'
import useSWR from 'swr'
import { formatUnits, isAddress } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsValues } from '@/src/constants/config/types'
import useBridgeLimits from '@/src/hooks/bridge/useBridgeLimits'
import { ZERO_BN } from '@/src/constants/misc'
import { formatNumber } from '@/src/utils/format'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'

export const useBridgeValidations = ({
  amount,
  fromChainId,
  recipient,
  toChainId,
  token,
  userAddress,
}: {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: BigNumber
  recipient?: string
  token: Token
}) => {
  const { readOnlyAppProvider } = useWeb3Connection()

  const isSCWallet = useSWR(
    userAddress && readOnlyAppProvider
      ? [`isSCWallet-${userAddress}`, userAddress, readOnlyAppProvider]
      : null,
    ([, address, provider]) => provider.getCode(address).then((code) => code !== '0x'),
  )
  const { data: bridgeLimits, isLoading } = useBridgeLimits(fromChainId, token?.address)
  if (!bridgeLimits) throw Error('Was not possible to fetch bridge limits.')

  const { data: tokenMode } = useTokenMode(fromChainId, toChainId, token)

  const { getFromBridgeWithSigner } = useBridgeContracts()
  const fromBridgeAddress = getFromBridgeWithSigner(fromChainId, toChainId, token.address).address

  const { data: userBalanceData } = useUserTokenBalances({
    userAddress,
    chainId: fromChainId,
    allowanceAddress: fromBridgeAddress,
    tokenAddress: token.address,
  })
  if (!userBalanceData) throw new Error('User balance data is not available')

  const isValidToken = token !== undefined
  const isValidAmount = amount.gt(0)
  const approvalNeeded = amount.gt(userBalanceData.allowance) && amount.lte(userBalanceData.balance)
  const minAmountError = amount.lt(bridgeLimits?.minPerTx || ZERO_BN)
  const maxAmountError = amount.gt(bridgeLimits?.maxPerTx || ZERO_BN)
  const dailyLimitReached = amount.gt(
    bridgeLimits?.dailyLimit.sub(bridgeLimits?.totalSpentPerDay || ZERO_BN) || ZERO_BN,
  )
  const minPerTxInNumber = Number(
    formatUnits(bridgeLimits?.minPerTx || ZERO_BN, token?.decimals || 18),
  )
  const maxPerTxInNumber = Number(
    formatUnits(bridgeLimits?.maxPerTx || ZERO_BN, token?.decimals || 18),
  )

  const errorMessage = useMemo(() => {
    try {
      if (!userAddress || !isValidAmount || !isValidToken) {
        return false
      }

      // is the wallet is a smart contract wallet, we need to request a recipient
      if (isSCWallet !== undefined && isSCWallet.data && !recipient) {
        throw Error('Please specify a recipient address')
      }
      if (!isValidAmount) {
        throw Error('Please specify amount')
      }

      if (recipient && !isAddress(recipient)) {
        throw Error('Please specify a valid recipient address')
      }

      if (minAmountError) {
        throw Error(
          `The least you can transfer in one transaction is ${formatNumber(minPerTxInNumber)} ${
            token.symbol
          }`,
        )
      }

      if (maxAmountError) {
        throw Error(
          `The most you can transfer in one transaction is ${formatNumber(maxPerTxInNumber)}`,
        )
      }

      if (dailyLimitReached) {
        throw Error(`We've reached the daily bridge limit amount.`)
      }

      if (amount.gt(userBalanceData.balance)) {
        throw Error('Insufficient balance')
      }

      return false
    } catch (error) {
      return (error as Error).message
    }
  }, [
    userAddress,
    isValidAmount,
    isValidToken,
    isSCWallet,
    recipient,
    minAmountError,
    maxAmountError,
    dailyLimitReached,
    amount,
    userBalanceData.balance,
    minPerTxInNumber,
    token.symbol,
    maxPerTxInNumber,
  ])

  const isValidToSend = !errorMessage && isValidAmount && isValidToken

  return {
    isSCWallet: isSCWallet?.data,
    errorMessage,
    shouldApprove: tokenMode === 'ERC20' && userBalanceData.allowance && amount && approvalNeeded,
    isValidToSend,
    isValidAmount,
    isValidToken,
    amountIsGreaterThanBalance: approvalNeeded,
    amountisLessThanMinPerTx: minAmountError,
    amountisGreaterThanMaxPerTx: maxAmountError,
    isLoading,
  }
}
