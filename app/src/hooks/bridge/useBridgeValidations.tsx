import { Token } from '@/types/token'
import { formatUnits, isAddress } from 'viem'
import { useMemo } from 'react'
import { useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsValues } from '@/src/constants/config/types'
import useBridgeLimits from '@/src/hooks/bridge/useBridgeLimits'
import { EURCe_GNOSIS, USDCe_GNOSIS } from '@/src/constants/misc'
import { formatNumber } from '@/src/utils/format'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { getBridgeContract } from '@/src/hooks/bridge/useBridgeContracts'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import useWeb3Name from '../useWeb3Name'

export const useBridgeValidations = ({
  amount,
  fromChainId,
  fromToken,
  recipient,
  toChainId,
  toToken,
  userAddress,
}: {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: bigint
  fromToken: Token
  toToken: Token | undefined
  recipient?: string
}) => {
  const { isSCWallet } = useWeb3Connection()
  const { data: bridgeLimits, isLoading } = useBridgeLimits(
    fromChainId,
    toChainId,
    fromToken,
    toToken,
  )
  // `useBridgeLimits` is wagmi-based and no longer suspends, so `bridgeLimits` is undefined during
  // the initial load. Every limit-derived check below guards on it, and `isValidToSend` stays false
  // until it resolves — keeping the bridge button disabled exactly as the old SWR suspense did.
  const { data: tokenMode } = useTokenMode(fromChainId, toChainId, fromToken)

  const bridgeContract = getBridgeContract(fromChainId, toChainId, fromToken.address)
  const bridgeAddress = bridgeContract.address

  const { data: userBalanceData, isLoading: isLoadingBalance } = useUserTokenBalances({
    userAddress,
    chainId: fromChainId,
    allowanceAddress: bridgeAddress,
    tokenAddress: fromToken.address,
  })

  const balance = userBalanceData?.balance
  const allowance = userBalanceData?.allowance

  const isValidToken = fromToken !== undefined
  const isValidAmount = amount > 0n
  const approvalNeeded =
    balance !== undefined && allowance !== undefined && amount > allowance && amount <= balance
  const minAmountError = bridgeLimits !== undefined && amount < bridgeLimits.minPerTx
  const maxAmountError = bridgeLimits !== undefined && amount > bridgeLimits.maxPerTx
  const dailyLimitReached =
    bridgeLimits !== undefined && amount > bridgeLimits.dailyLimit - bridgeLimits.totalSpentPerDay
  const minPerTxInNumber = Number(
    formatUnits(bridgeLimits?.minPerTx || 0n, fromToken?.decimals || 18),
  )
  const maxPerTxInNumber = Number(
    formatUnits(bridgeLimits?.maxPerTx || 0n, fromToken?.decimals || 18),
  )

  const isDomainName = isValidDomainName(recipient || '')

  const { resolvedAddress } = useWeb3Name({ name: isDomainName ? recipient : undefined })

  const isCustomERC20Home =
    fromChainId === 100 &&
    tokenMode === 'ERC20' &&
    fromToken.address !== NATIVE_TOKEN_ADDRESS.toLowerCase() &&
    fromToken.address !== USDCe_GNOSIS.toLowerCase() &&
    fromToken.address !== EURCe_GNOSIS.toLowerCase()

  const errorMessage = useMemo(() => {
    try {
      if (!userAddress || !isValidAmount || !isValidToken) {
        return false
      }

      if (isCustomERC20Home) {
        throw Error('This token currently is not supported on the Gnosis Bridge')
      }

      // is the wallet is a smart contract wallet, we need to request a recipient
      if (isSCWallet && !recipient) {
        throw Error('Please specify a recipient address')
      }
      if (!isValidAmount) {
        throw Error('Please specify amount')
      }

      if (recipient && !isAddress(recipient) && !isDomainName) {
        throw Error('Please specify a valid recipient address')
      }

      if (isDomainName && !resolvedAddress) {
        throw Error('Domain name is not resolved')
      }

      if (minAmountError) {
        throw Error(
          `The least you can transfer in one transaction is ${formatNumber(minPerTxInNumber)} ${
            fromToken.symbol
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

      if (balance !== undefined && amount > balance) {
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
    isCustomERC20Home,
    isSCWallet,
    recipient,
    minAmountError,
    maxAmountError,
    dailyLimitReached,
    amount,
    balance,
    minPerTxInNumber,
    fromToken.symbol,
    maxPerTxInNumber,
    isDomainName,
    resolvedAddress,
  ])

  const isValidToSend =
    bridgeLimits !== undefined &&
    !errorMessage &&
    isValidAmount &&
    isValidToken &&
    !isCustomERC20Home &&
    balance !== undefined

  return {
    errorMessage,
    shouldApprove: tokenMode !== 'ERC677' && amount > 0n && approvalNeeded,
    isValidToSend,
    isValidAmount,
    isValidToken,
    amountIsGreaterThanBalance: approvalNeeded,
    amountisLessThanMinPerTx: minAmountError,
    amountisGreaterThanMaxPerTx: maxAmountError,
    isLoading: isLoading || isLoadingBalance,
  }
}
