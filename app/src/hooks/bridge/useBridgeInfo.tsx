import { BigNumber } from 'ethers'

import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { ZERO_BN } from '@/src/constants/misc'
import { parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { fromBN } from '@/src/utils/bigNumber'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { useBridgeBalance } from '@/src/hooks/bridge/useBridgeBalance'
import { useBridgeFee } from '@/src/hooks/bridge/useBridgeFee'
import { useBridgeTokenOutInfo } from '@/src/hooks/bridge/useBridgeTokenOutInfo'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import { useBridgeValidations } from '@/src/hooks/bridge/useBridgeValidations'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { useTokenMode } from '@/src/hooks/bridge/useTokenMode'

export const useBridgeInfo = ({
  amount,
  fromChainId,
  receiveNativeToken = false,
  recipient,
  toChainId,
  token,
}: {
  fromChainId: ChainsValues
  receiveNativeToken: boolean
  toChainId: ChainsValues
  token?: Token
  amount?: string
  allowance?: BigNumber
  recipient?: string
}) => {
  const { foreignChainId, isDAI, isFromForeign, isFromHome, isNativeBridge, isNativeToken } =
    getBridgeCommonInfo({
      fromChainId,
      toChainId,
      tokenAddress: token?.address || '',
      receiveNativeToken,
    })

  const { bridgeContracts, getFromBridgeAddress } = useBridgeContracts(foreignChainId)

  const fromBridgeAddress = getFromBridgeAddress(isFromHome, isNativeBridge, isNativeToken)

  const amountBN = useMemo(() => {
    if (!amount || !token) {
      return ZERO_BN
    }
    try {
      return parseUnits(amount, token.decimals)
    } catch (error) {
      console.log(error)
      return ZERO_BN
    }
  }, [amount, token])

  const { data: tokenMode, isLoading: isLoadingTokenMode } = useTokenMode(
    isFromHome,
    foreignChainId,
    isNativeBridge,
    isNativeToken,
    token,
  )

  const {
    data: bridgeBalanceInfo,
    isLoading: isLoadingBalanceInfo,
    mutate: refreshBalance,
  } = useBridgeBalance({
    fromChainId,
    toChainId,
    isNativeToken,
    fromBridgeAddress,
    token,
  })

  const { data: bridgeTokenOutInfo, isLoading: isLoadingTokenOutInfo } = useBridgeTokenOutInfo({
    fromChainId,
    homeOmni: bridgeContracts.homeOmniBridge,
    isDAI,
    isFromForeign,
    isFromHome,
    isNativeToken,
    receiveNativeToken,
    toChainId,
    tokenAddress: token?.address,
  })

  const { data: bridgeFeeInfo, isLoading: isLoadingFeeInfo } = useBridgeFee({
    amount: amountBN,
    foreignChainId,
    isFromHome,
    isNativeBridge,
    token,
  })

  const {
    errorMessage,
    isSCWallet,
    isValidToSend: isValidToBridge,
    shouldApprove,
  } = useBridgeValidations({
    fromChainId,
    accountBalance: bridgeBalanceInfo?.balance || ZERO_BN,
    amount: amountBN,
    allowance: bridgeBalanceInfo?.allowance || ZERO_BN,
    tokenMode,
    recipient,
    token,
  })

  const { data: bridgeTransactionInfo, isLoading: isLoadingTransactionInfo } =
    useBridgeTransactionInfo({
      shouldApprove,
      isValid: isValidToBridge,
      amount: amountBN,
      foreignChainId,
      isFromHome,
      receiveNativeToken,
      isNativeBridge,
      isNativeToken,
      tokenMode,
      recipient,
      token,
    })

  const isLoadingInfo =
    isLoadingBalanceInfo ||
    isLoadingTokenOutInfo ||
    isLoadingFeeInfo ||
    isLoadingTransactionInfo ||
    isLoadingTokenMode

  return {
    ...(bridgeBalanceInfo || { balance: ZERO_BN, allowance: ZERO_BN }),
    ...(bridgeTokenOutInfo || {
      tokenOutAddress: undefined,
    }),
    ...(bridgeTransactionInfo || {
      gasLimit: ZERO_BN,
      gasPrice: ZERO_BN,
      tx: null,
    }),
    toAmount: fromBN(amountBN.sub(bridgeFeeInfo || ZERO_BN), token?.decimals) || '0',
    fromBridgeAddress: fromBridgeAddress,
    fee: bridgeFeeInfo || ZERO_BN,
    shouldApprove,
    isSCWallet,
    canBridge: isValidToBridge,
    errorMessage,
    isLoadingInfo,
    isDAI,
    isFromForeign,
    refreshBalance,
  }
}
