import { BigNumber, BigNumberish, Signer } from 'ethers'
import { JsonRpcBatchProvider } from '@ethersproject/providers'

import { Chains, ChainsValues } from '@/src/constants/config/types'
import { chainsConfig, getNetworkConfig } from '@/src/constants/config/chains'
import {
  ERC20__factory,
  ForeignBridgeErcToNative,
  ForeignBridgeErcToNative__factory,
  ForeignOmniMediator,
  ForeignOmniMediator__factory,
  HomeBridgeErcToNative,
  HomeBridgeErcToNative__factory,
  HomeOmniMediator,
  HomeOmniMediator__factory,
  OmniBridgeFeeManager__factory,
} from '@/types/typechain'
import { BridgeContractKey, contracts } from '@/src/constants/config/contracts'
import { isSameString } from '@/src/utils/tools'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { MAX_UINT_256, ZERO_BN } from '@/src/constants/misc'
import { isAddress, parseUnits } from 'ethers/lib/utils'
import { useEffect, useMemo, useRef } from 'react'
import { useWeb3ConnectedApp } from '@/src/providers/web3ConnectionProvider'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { useContractBridgeWithSigner } from '@/src/hooks/bridge/useBridgeWithSigner'
import { NumberType, formatUnits } from '@/src/utils/numberFormat'

// CONSTANTS
const foreignToHomeFeeKey = '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625'
const homeToForeignFeeKey = '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26'
const MIN_PER_TX = 0 // TODO: set this latter
const MAX_PER_TX = MAX_UINT_256 // TODO: set this latter

// HELPERS
const getNetworkConfigAndRpcProvider = (chainId: ChainsValues) => {
  const config = getNetworkConfig(chainId)
  const rpcProvider = new JsonRpcBatchProvider(config.rpcUrl)

  return { config, rpcProvider }
}

/**
 * Handles the common bridge information based on the provided parameters.
 * @param fromChainId The ID of the source chain.
 * @param toChainId The ID of the destination chain.
 * @param tokenAddress The address of the token being bridged.
 * @param receiveNativeToken Optional. Indicates whether the token being bridged is received as a native token.
 * @returns An object containing various bridge-related information.
 */
const handleBridgeCommonInfo = ({
  fromChainId,
  receiveNativeToken,
  toChainId,
  tokenAddress,
}: {
  fromChainId: ChainsValues
  toChainId: ChainsValues
  tokenAddress: string
  receiveNativeToken?: boolean
}) => {
  const isFromHome = fromChainId === Chains.gnosis
  const isFromForeign = !isFromHome
  const isNativeToken = NATIVE_TOKEN_ADDRESS.toLowerCase() === tokenAddress.toLowerCase()
  const isERC20 = !isNativeToken
  const isDAI = isSameString(chainsConfig[fromChainId].bridge.DAI, tokenAddress) // assumes fromChain is foreign.

  const isNativeBridge =
    (isFromHome && isNativeToken) || (isFromForeign && isDAI && receiveNativeToken) // native bridge == xDAI bridge

  const foreignChainId = isFromForeign ? fromChainId : toChainId

  const { config: homeConfig, rpcProvider: homeRpcProvider } = getNetworkConfigAndRpcProvider(
    Chains.gnosis,
  )
  const { config: foreignConfig, rpcProvider: foreignRpcProvider } =
    getNetworkConfigAndRpcProvider(foreignChainId)

  const bridgeContracts = {
    homeNativeBridge: HomeBridgeErcToNative__factory.connect(
      contracts.homeXdaiBridge.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    foreignNativeBridge: ForeignBridgeErcToNative__factory.connect(
      contracts.foreignXdaiBridge.address[foreignConfig.chainId],
      foreignRpcProvider,
    ),
    omniFeeManager: OmniBridgeFeeManager__factory.connect(
      contracts.omnibridgeFeeManager.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    homeOmniBridge: HomeOmniMediator__factory.connect(
      contracts.homeOmniBridge.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    foreignOmniBridge: ForeignOmniMediator__factory.connect(
      contracts.foreignOmniBridge.address[foreignConfig.chainId],
      foreignRpcProvider,
    ),
  }

  let fromBridgeAddress: string
  let bridgeContractKey: BridgeContractKey
  if (isFromHome) {
    fromBridgeAddress = isNativeBridge
      ? bridgeContracts.homeNativeBridge.address
      : bridgeContracts.homeOmniBridge.address
    bridgeContractKey = isNativeBridge
      ? BridgeContractKey.HomeXdaiBridge
      : BridgeContractKey.HomeOmniBridge
  } else {
    fromBridgeAddress = isNativeBridge
      ? bridgeContracts.foreignNativeBridge.address
      : bridgeContracts.foreignOmniBridge.address
    bridgeContractKey = isNativeBridge
      ? BridgeContractKey.ForeignXdaiBridge
      : BridgeContractKey.ForeignOmniBridge
  }

  return {
    foreignChainId,
    isFromHome,
    isFromForeign,
    isERC20,
    isNativeToken,
    isDAI,
    isNativeBridge,
    bridgeContractKey,
    fromBridgeAddress,
    bridgeContracts,
  }
}

// TODO: add to the readme the steps to support a new foreign chain.
// TODO: what should we do with WXDAI? Should we ban it?

// #### mainnet > gnosis
// DAI > xDAI (native token)
// ETH > WETH

// #### gnosis > mainnet
// xDAI > DAI
// WXDAI > (Algún warning, ya q WXDAI en mainnet no te sirve pa nada, tal veo lo tendriamos q sacar de la lista)
// DAI a DAI (en caso q ya hayan bridgeo de algun modo mal)
// WETH > WETH (van a recibir el ERC20)
// WETH > ETH (van a recibir native token en mainnet)

// This function fetches the balances of a specific token for a given account on a specific chain.
// It first checks if the token is an ERC20 token by evaluating the isERC20 flag.
// If it is an ERC20 token, it uses the generated factory class (ERC20__factory) to create an instance of the ERC20 contract.
// It then calls the `balanceOf` function on the ERC20 contract instance to get the balance of the token for the specified account.
// If the token is not an ERC20 token, it assumes it is a native token and directly retrieves the balance using the `getBalance` function.
// The function returns an object containing the balances of the specified token for the given account on the specified chain.
/**
 * Fetches the balances and allowance of a user's account for a bridge transaction.
 * @param account - The user's account address.
 * @param bridgeAddress - The address of the bridge contract.
 * @param provider - The JSON-RPC batch provider.
 * @param signer - The signer object.
 * @param tokenAddress - The address of the token contract (if isERC20 is true).
 * @param isERC20 - Indicates whether the token is an ERC20 token.
 * @returns A promise that resolves to an object containing the balance and allowance.
 */
const fetchBalances = async ({
  account,
  bridgeAddress,
  isERC20,
  provider,
  signer,
  tokenAddress,
}: {
  account: string
  bridgeAddress: string
  provider: JsonRpcBatchProvider
  signer: Signer
  tokenAddress: string
  isERC20: boolean
}): Promise<{
  balance: BigNumber
  allowance: BigNumber
}> => {
  if (isERC20) {
    try {
      const erc20 = ERC20__factory.connect(tokenAddress, provider)

      const balances = await Promise.all([
        erc20.balanceOf(account),
        erc20.allowance(account, bridgeAddress),
      ])

      const [balance, allowance] = balances

      return {
        balance,
        allowance,
      }
    } catch (error) {
      console.log(error)
      return {
        balance: ZERO_BN,
        allowance: ZERO_BN,
      }
    }
  } else {
    return {
      balance: await signer.getBalance(),
      allowance: MAX_UINT_256,
    }
  }
}

/**
 * Retrieves information about the received token based on the provided parameters.
 * @param amount The amount of the token.
 * @param fromChainId The ID of the chain where the token is being sent from.
 * @param receiveNativeToken A boolean indicating whether the token is received as a native token.
 * @param toChainId The ID of the chain where the token is being sent to.
 * @param tokenAddress The address of the token.
 * @returns A promise that resolves to an object containing the tokenOutAddress, fee, and canReceiveNativeToken (optional).
 * @throws Error if the parameters are invalid.
 */
const getReceivedTokenInfo = async ({
  fromChainId,
  receiveNativeToken,
  toChainId,
  tokenAddress,
}: {
  fromChainId: ChainsValues
  receiveNativeToken: boolean
  toChainId: ChainsValues
  tokenAddress: string
}): Promise<{ tokenOutAddress: string; canReceiveNativeToken?: boolean }> => {
  const {
    bridgeContracts: { homeOmniBridge: homeOmni },
    isDAI,
    isFromForeign,
    isFromHome,
    isNativeToken,
  } = handleBridgeCommonInfo({
    fromChainId: fromChainId,
    toChainId: toChainId,
    tokenAddress: tokenAddress,
    receiveNativeToken: receiveNativeToken,
  })

  //---------------
  // foreign > Gnosis
  //---------------

  // DAI (foreign) > DAI (home) or xDAI (native token)
  if (isFromForeign && isDAI) {
    return {
      tokenOutAddress: receiveNativeToken
        ? NATIVE_TOKEN_ADDRESS
        : chainsConfig[Chains.gnosis].bridge.DAI,
      canReceiveNativeToken: true,
    }
  }

  // Native (form example ETH)
  // we use this one to detect that the token on the other side is WETH.
  if (isFromForeign && isNativeToken) {
    return {
      tokenOutAddress: chainsConfig[Chains.gnosis].bridge.wForeignNative,
    }
  }

  // default to ERC20
  if (isFromForeign) {
    return {
      tokenOutAddress: await homeOmni.homeTokenAddress(tokenAddress),
    }
  }

  //---------------
  // Gnosis > foreign
  //---------------

  // xDAI
  if (isFromHome && isNativeToken) {
    return {
      tokenOutAddress: chainsConfig[toChainId].bridge.DAI,
    }
  }

  // WETH > ETH or WETH
  if (isFromHome && isSameString(chainsConfig[Chains.gnosis].bridge.wForeignNative, tokenAddress)) {
    return {
      tokenOutAddress: receiveNativeToken
        ? NATIVE_TOKEN_ADDRESS
        : chainsConfig[toChainId].bridge.wForeignNative,
      canReceiveNativeToken: true,
    }
  }

  // default to ERC20
  if (isFromHome) {
    return {
      tokenOutAddress: await homeOmni.foreignTokenAddress(tokenAddress),
    }
  }

  throw Error('Invalid params')
}

/**
 * Retrieves the necessary information for a bridge transaction.
 * @param amount - The amount to be transferred.
 * @param bridgeContract - The bridge contract to be used for the transaction.
 * @param isFromHome - Indicates whether the transaction is from the home network.
 * @param isNativeBridge - Indicates whether the bridge is a native bridge.
 * @param recipient - The recipient of the transaction.
 * @param signer - The signer for the transaction.
 * @param tokenAddress - The address of the token to be transferred.
 * @returns An object containing the transaction function, gas price, and gas limit.
 */
const getBridgeTx = async ({
  amount,
  bridgeContract,
  isFromHome,
  isNativeBridge,
  recipient,
  signer,
  tokenAddress,
}: {
  amount: BigNumber
  bridgeContract:
    | HomeBridgeErcToNative
    | HomeOmniMediator
    | ForeignBridgeErcToNative
    | ForeignOmniMediator
  signer: Signer
  tokenAddress: string
  isNativeBridge: boolean
  isFromHome?: boolean
  recipient?: string
}) => {
  let gasPrice = ZERO_BN
  let gasLimit = ZERO_BN
  let tx = null

  if (amount.lte(0)) {
    return {
      tx,
      gasPrice,
      gasLimit,
    }
  }

  // ---------------
  // xDaiBridge tx
  // ---------------
  if (isNativeBridge) {
    // Gnosis > foreign
    if (isFromHome) {
      const homeBridgeContract = bridgeContract as HomeBridgeErcToNative // Type assertion

      try {
        gasPrice = await signer.getGasPrice()
        gasLimit = recipient
          ? await homeBridgeContract.estimateGas.relayTokens(recipient, { value: amount })
          : await signer.estimateGas({ to: bridgeContract.address, value: amount })
      } catch (error) {
        console.error(error)
        throw Error('There is an error with your values. Please check and try again.')
      }

      tx = async function () {
        try {
          if (recipient) {
            return await homeBridgeContract.relayTokens(recipient, {
              gasPrice,
              gasLimit,
              value: amount,
            })
          } else {
            return await signer.sendTransaction({
              to: bridgeContract.address,
              value: amount,
              gasPrice,
              gasLimit,
            })
          }
        } catch (error) {
          console.error('Error on transaction:', error)
          throw error
        }
      }
      // Foreign > Gnosis
    } else {
      const foreignBridgeContract = bridgeContract as ForeignBridgeErcToNative // Type assertion

      const tokenContract = ERC20__factory.connect(tokenAddress, signer)

      try {
        gasPrice = await signer.getGasPrice()
        gasLimit = recipient
          ? await foreignBridgeContract.estimateGas.relayTokens(recipient, amount)
          : await tokenContract.estimateGas.transfer(bridgeContract.address, amount)
      } catch (error) {
        console.error(error)
        throw Error('There is an error with your values. Please check and try again.')
      }

      tx = function () {
        return recipient
          ? foreignBridgeContract.relayTokens(recipient, amount, {
              gasPrice,
              gasLimit,
            })
          : tokenContract.transfer(bridgeContract.address, amount, {
              gasPrice,
              gasLimit,
            })
      }
    }
  }

  // ---------------
  // OmniBridge tx
  // ---------------
  else {
    // @TODO OmniBridge tx
  }

  return {
    tx,
    gasPrice,
    gasLimit,
  }
}

const useBridgeBalance = ({
  fromBridgeAddress,
  isERC20,
  token,
}: {
  isERC20: boolean
  fromBridgeAddress?: string
  token?: Token
}) => {
  const { address, readOnlyAppBatchProvider, web3Provider } = useWeb3ConnectedApp()
  const signer = web3Provider.getSigner()

  const shouldFetch = address && token && fromBridgeAddress && signer
  console.log('BALANCES ===>>', {
    address,
    token,
    fromBridgeAddress,
    signer,
    shouldFetch,
  })

  return useSWR(
    shouldFetch ? [address, token, isERC20, fromBridgeAddress, 'bridgeBalance'] : null,
    async ([_account, _token, _isERC20, _fromBridgeAddress]) => {
      console.log('sadfjkasdkjfasdgkjashghdkfkashdhjk')

      try {
        return fetchBalances({
          provider: readOnlyAppBatchProvider,
          signer: signer,
          bridgeAddress: _fromBridgeAddress,
          tokenAddress: _token.address,
          account: _account,
          isERC20: _isERC20,
        })
      } catch (error) {
        console.error(error)

        return {
          balance: BigNumber.from(0),
          allowance: BigNumber.from(0),
        }
      }
    },
    { suspense: false },
  )
}

const useBridgeTokenOutInfo = ({
  fromChainId,
  receiveNativeToken = false,
  toChainId,
  token,
}: {
  fromChainId: ChainsValues
  receiveNativeToken: boolean
  toChainId: ChainsValues
  token?: Token
}) => {
  const shouldFetch = token && fromChainId && toChainId

  return useSWR(
    shouldFetch ? [token, fromChainId, toChainId, receiveNativeToken, 'bridgeTokenOut'] : null,
    async ([_token, _fromChainId, _toChainId, _receiveNativeToken]) => {
      return getReceivedTokenInfo({
        tokenAddress: _token.address,
        receiveNativeToken: _receiveNativeToken,
        fromChainId: _fromChainId,
        toChainId: _toChainId,
      })
    },
    { suspense: false },
  )
}

const useBridgeFee = ({
  amount,
  fromChainId,
  receiveNativeToken = false,
  toChainId,
  token,
}: {
  amount: BigNumberish
  fromChainId: ChainsValues
  receiveNativeToken: boolean
  toChainId: ChainsValues
  token?: Token
}) => {
  const shouldFetch = token && fromChainId && toChainId

  return useSWR(
    shouldFetch ? [token, fromChainId, toChainId, receiveNativeToken, amount, 'bridgeFee'] : null,
    async ([_token, _fromChainId, _toChainId, _receiveNativeToken, _amount]) => {
      const {
        bridgeContracts: { homeNativeBridge: homeBridge, omniFeeManager },
        isFromHome,
        isNativeBridge,
      } = handleBridgeCommonInfo({
        fromChainId: _fromChainId,
        toChainId: _toChainId,
        tokenAddress: _token.address,
        receiveNativeToken: _receiveNativeToken,
      })

      if (isNativeBridge) {
        return isFromHome ? homeBridge.getHomeFee() : homeBridge.getForeignFee()
      } else {
        return isFromHome
          ? omniFeeManager.calculateFee(homeToForeignFeeKey, _token.address, _amount)
          : omniFeeManager.calculateFee(foreignToHomeFeeKey, _token.address, _amount)
      }
    },
    { suspense: false },
  )
}

const useBridgeValidations = ({
  accountBalance,
  allowance,
  amount,
  recipient,
  token,
}: {
  accountBalance: BigNumber
  amount: BigNumber
  recipient?: string
  allowance?: BigNumber
  token?: Token
}) => {
  const isFirstRender = useRef(true)
  // TODO Missing validations here
  const amountIsGreaterThanBalance = amount.gt(accountBalance)
  const amountisLessThanMinPerTx = amount.lt(MIN_PER_TX)
  const amountisGreaterThanMaxPerTx = amount.gt(MAX_PER_TX)
  const isValidAmount = amount.gt(0)

  const isValidToken = !!token

  const shouldApprove =
    (allowance && amount && allowance.lt(amount) && !amountIsGreaterThanBalance) || false

  const isValidRecipient = !!recipient && isAddress(recipient)

  // check if is the first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }
  }, [])

  const errorMessage = useMemo(() => {
    try {
      // disable validation error on first render
      if (isFirstRender.current || !isValidToken) {
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
    isValidToken,
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

const useBridgeTransactionInfo = ({
  accountBalance,
  amount,
  fromChainId,
  receiveNativeToken = false,
  recipient,
  toChainId,
  token,
}: {
  accountBalance: BigNumber
  amount: BigNumber
  fromChainId: ChainsValues
  receiveNativeToken: boolean
  recipient?: string
  toChainId: ChainsValues
  token?: Token
}) => {
  const getContractBridgeWithSigner = useContractBridgeWithSigner()

  const { isValidToSend: isValid } = useBridgeValidations({
    accountBalance,
    amount,
    token,
  })

  const shouldFetch = token && fromChainId && toChainId && isValid

  return useSWR(
    shouldFetch
      ? [token, fromChainId, toChainId, receiveNativeToken, amount, recipient, 'transactionInfo']
      : null,

    async ([_token, _fromChainId, _toChainId, _receiveNativeToken, _amount, _recipient]) => {
      const { bridgeContractKey, isFromHome, isNativeBridge } = handleBridgeCommonInfo({
        fromChainId: _fromChainId,
        toChainId: _toChainId,
        tokenAddress: _token.address,
        receiveNativeToken: _receiveNativeToken,
      })

      const bridgeContractWithSigner = getContractBridgeWithSigner(bridgeContractKey)

      try {
        const { gasLimit, gasPrice, tx } = await getBridgeTx({
          amount: _amount,
          isNativeBridge: isNativeBridge || false,
          bridgeContract: bridgeContractWithSigner,
          signer: bridgeContractWithSigner.signer,
          tokenAddress: _token.address,
          recipient: _recipient,
          isFromHome,
        })

        return {
          gasLimit,
          gasPrice,
          tx,
        }
      } catch (error) {
        console.error(error)

        return {
          gasLimit: ZERO_BN,
          gasPrice: ZERO_BN,
          tx: null,
        }
      }
    },
    { suspense: false },
  )
}

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
  const commonInfo = useMemo(() => {
    if (!token) {
      return undefined
    }

    return handleBridgeCommonInfo({
      fromChainId,
      toChainId,
      tokenAddress: token.address,
      receiveNativeToken,
    })
  }, [fromChainId, receiveNativeToken, toChainId, token])

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

  const {
    data: bridgeBalanceInfo,
    isLoading: isLoadingBalanceInfo,
    mutate: refreshBalance,
  } = useBridgeBalance({
    isERC20: commonInfo?.isERC20 || false,
    fromBridgeAddress: commonInfo?.fromBridgeAddress,
    token,
  })

  const { data: bridgeTokenOutInfo, isLoading: isLoadingTokenOutInfo } = useBridgeTokenOutInfo({
    fromChainId,
    receiveNativeToken,
    toChainId,
    token,
  })

  const { data: bridgeFeeInfo, isLoading: isLoadingFeeInfo } = useBridgeFee({
    amount: amountBN,
    fromChainId,
    receiveNativeToken,
    toChainId,
    token,
  })

  const { data: bridgeTransactionInfo, isLoading: isLoadingTransactionInfo } =
    useBridgeTransactionInfo({
      amount: amountBN,
      fromChainId,
      receiveNativeToken,
      recipient,
      toChainId,
      token,
      accountBalance: bridgeBalanceInfo?.balance || ZERO_BN,
    })

  const {
    errorMessage,
    isValidToSend: isValid,
    shouldApprove,
  } = useBridgeValidations({
    accountBalance: bridgeBalanceInfo?.balance || ZERO_BN,
    amount: amountBN,
    allowance: bridgeBalanceInfo?.allowance,
    recipient,
    token,
  })

  console.log('BridgeInfo', {
    ...bridgeBalanceInfo,
    ...bridgeTokenOutInfo,
    ...bridgeTransactionInfo,
    fee: bridgeFeeInfo,
    errorMessage,
    isValid,
    shouldApprove,
    amountBN: amountBN.toString(),
  })

  const isLoadingInfo = useMemo(
    () =>
      isLoadingBalanceInfo || isLoadingTokenOutInfo || isLoadingFeeInfo || isLoadingTransactionInfo,
    [isLoadingBalanceInfo, isLoadingFeeInfo, isLoadingTokenOutInfo, isLoadingTransactionInfo],
  )

  const toAmountForDisplay = useMemo(() => {
    try {
      return formatUnits({
        value: amountBN,
        decimals: token?.decimals || 18,
        numberType: NumberType.SwapTradeAmount,
      })
    } catch (error) {
      return formatUnits({
        value: ZERO_BN,
        decimals: token?.decimals || 18,
        numberType: NumberType.SwapTradeAmount,
      })
    }
  }, [amountBN, token])

  return {
    ...(bridgeBalanceInfo || { balance: ZERO_BN, allowance: ZERO_BN }),
    ...(bridgeTokenOutInfo || {
      tokenOutAddress: undefined,
      canReceiveNativeToken: false,
    }),
    ...(bridgeTransactionInfo || {
      gasLimit: ZERO_BN,
      gasPrice: ZERO_BN,
      tx: null,
    }),
    toAmount: toAmountForDisplay,
    fromBridgeAddress: commonInfo?.fromBridgeAddress,
    fee: bridgeFeeInfo || ZERO_BN,
    shouldApprove,
    canBridge: isValid,
    errorMessage,
    isLoadingInfo,
    isDAI: commonInfo?.isDAI,
    isFromForeign: commonInfo?.isFromForeign,
    refreshBalance,
  }
}
