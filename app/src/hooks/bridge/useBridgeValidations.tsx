import { BigNumber } from 'ethers'
import { Token } from '@/types/token'
import { formatUnits, isAddress } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsValues } from '@/src/constants/config/types'
import useBridgeLimits from '@/src/hooks/bridge/useBridgeLimits'
import { EURCe_GNOSIS, USDCe_GNOSIS, ZERO_BN } from '@/src/constants/misc'
import { formatNumber } from '@/src/utils/format'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { getBridgeContractAddress } from '@/src/hooks/bridge/useBridgeContracts'
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
  amount: BigNumber
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
  if (!bridgeLimits) throw Error('Was not possible to fetch bridge limits.')

  const { data: tokenMode } = useTokenMode(fromChainId, toChainId, fromToken)

  const bridgeContractAddress = getBridgeContractAddress(fromChainId, toChainId, fromToken.address)

  const { data: userBalanceData } = useUserTokenBalances({
    userAddress,
    chainId: fromChainId,
    allowanceAddress: bridgeContractAddress,
    tokenAddress: fromToken.address,
  })
  if (!userBalanceData) throw new Error('User balance data is not available')

  const isValidToken = fromToken !== undefined
  const isValidAmount = amount.gt(0)
  const approvalNeeded = amount.gt(userBalanceData.allowance) && amount.lte(userBalanceData.balance)
  const minAmountError = amount.lt(bridgeLimits?.minPerTx || ZERO_BN)
  const maxAmountError = amount.gt(bridgeLimits?.maxPerTx || ZERO_BN)
  const dailyLimitReached = amount.gt(
    bridgeLimits?.dailyLimit.sub(bridgeLimits?.totalSpentPerDay || ZERO_BN) || ZERO_BN,
  )
  const minPerTxInNumber = Number(
    formatUnits(bridgeLimits?.minPerTx || ZERO_BN, fromToken?.decimals || 18),
  )
  const maxPerTxInNumber = Number(
    formatUnits(bridgeLimits?.maxPerTx || ZERO_BN, fromToken?.decimals || 18),
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
    isCustomERC20Home,
    isSCWallet,
    recipient,
    minAmountError,
    maxAmountError,
    dailyLimitReached,
    amount,
    userBalanceData.balance,
    minPerTxInNumber,
    fromToken.symbol,
    maxPerTxInNumber,
    isDomainName,
    resolvedAddress,
  ])

  const isValidToSend = !errorMessage && isValidAmount && isValidToken && !isCustomERC20Home

  return {
    errorMessage,
    shouldApprove: tokenMode !== 'ERC677' && userBalanceData.allowance && amount && approvalNeeded,
    isValidToSend,
    isValidAmount,
    isValidToken,
    amountIsGreaterThanBalance: approvalNeeded,
    amountisLessThanMinPerTx: minAmountError,
    amountisGreaterThanMaxPerTx: maxAmountError,
    isLoading,
  }
}
