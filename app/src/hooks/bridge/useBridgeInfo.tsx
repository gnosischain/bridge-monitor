import { BigNumber, BigNumberish } from 'ethers'
import { JsonRpcBatchProvider } from '@ethersproject/providers'

import { Chains, ChainsValues } from '@/src/constants/config/types'
import { chainsConfig, getNetworkConfig } from '@/src/constants/config/chains'
import {
  ERC20__factory,
  HomeBridgeErcToNative__factory,
  HomeOmniMediator__factory,
  OmniBridgeFeeManager__factory,
} from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { isSameString } from '@/src/utils/tools'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { MAX_UINT_256, ZERO_BN } from '@/src/constants/misc'
import { laggy } from '@/src/utils/swr-laggy'
import { parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { useWeb3ConnectedApp } from '@/src/providers/web3ConnectionProvider'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'

// TYPES
enum BridgeContractKey {
  HomeOmniBridge = 'homeOmniBridge',
  HomeXdaiBridge = 'homeXdaiBridge',
}

// CONSTANTS
const foreignToHomeFeeKey = '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625'
const homeToForeignFeeKey = '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26'

// HELPERS
export const getNetworkConfigAndRpcProvider = (chainId: ChainsValues) => {
  const config = getNetworkConfig(chainId)
  const rpcProvider = new JsonRpcBatchProvider(config.rpcUrl)

  return { config, rpcProvider }
}

const handleERC20Token = async (
  rpcProvider: JsonRpcBatchProvider,
  tokenAddress: string,
  account: string,
  bridgeAddress: string,
) => {
  const erc20 = ERC20__factory.connect(tokenAddress, rpcProvider)

  const balances = await Promise.all([
    erc20.balanceOf(account),
    erc20.allowance(account, bridgeAddress),
    erc20.decimals(),
  ])

  const [balance, allowance] = balances

  return {
    balance,
    allowance,
  }
}

const handleNativeToken = async (rpcProvider: JsonRpcBatchProvider, account: string) => {
  const balance = await rpcProvider.getBalance(account)

  return {
    balance,
    allowance: MAX_UINT_256,
  }
}

export const handleBridgeCommonInfo = ({
  fromChainId,
  receiveNativeToken,
  tokenAddress,
}: {
  fromChainId: ChainsValues
  tokenAddress: string
  receiveNativeToken?: boolean
}) => {
  const isFromHome = fromChainId === Chains.gnosis
  const isFromForeign = !isFromHome
  const isNativeToken = NATIVE_TOKEN_ADDRESS.toLowerCase() === tokenAddress.toLowerCase()
  const isERC20 = !isNativeToken
  const isDAI = isSameString(chainsConfig[fromChainId].bridge.DAI, tokenAddress) // assumes fromChain is foreign.
  const isWETH = isSameString(chainsConfig[fromChainId].bridge.wForeignNative, tokenAddress) // assumes fromChain is home.

  const isNativeBridge =
    (isFromHome && isNativeToken) || (isFromForeign && isDAI && receiveNativeToken) // native bridge == xDAI bridge

  const bridgeContractKey = isNativeBridge
    ? BridgeContractKey.HomeXdaiBridge
    : BridgeContractKey.HomeOmniBridge

  const fromBridgeAddress = contracts[bridgeContractKey].address[fromChainId]

  return {
    isFromHome,
    isFromForeign,
    isERC20,
    isNativeToken,
    isDAI,
    isNativeBridge,
    bridgeContractKey,
    fromBridgeAddress,
    isWETH,
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
const fetchBalances = async ({
  account,
  bridgeAddress,
  isERC20,
  provider,
  tokenAddress,
}: {
  account: string
  bridgeAddress: string
  provider: JsonRpcBatchProvider
  tokenAddress: string
  isERC20: boolean
}): Promise<{
  balance: BigNumber
  allowance: BigNumber
}> => {
  if (isERC20) {
    const { allowance, balance } = await handleERC20Token(
      provider,
      tokenAddress,
      account,
      bridgeAddress,
    )

    return {
      balance,
      allowance,
    }
  } else {
    const { allowance, balance } = await handleNativeToken(provider, account)
    return {
      balance,
      allowance,
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
  amount,
  fromChainId,
  receiveNativeToken,
  toChainId,
  tokenAddress,
}: {
  fromChainId: ChainsValues
  receiveNativeToken: boolean
  toChainId: ChainsValues
  tokenAddress: string
  amount: BigNumberish
}): Promise<{ tokenOutAddress: string; fee: BigNumber; canReceiveNativeToken?: boolean }> => {
  const { isDAI, isFromForeign, isFromHome, isNativeToken } = handleBridgeCommonInfo({
    fromChainId: fromChainId,
    tokenAddress: tokenAddress,
    receiveNativeToken: receiveNativeToken,
  })

  // ---------------
  // Setting contracts and rpc
  // ---------------
  const foreignChainId = isFromForeign ? fromChainId : toChainId

  const { config: homeConfig, rpcProvider: homeRpcProvider } = getNetworkConfigAndRpcProvider(
    Chains.gnosis,
  )
  const { config: foreignConfig, rpcProvider: foreignRpcProvider } =
    getNetworkConfigAndRpcProvider(foreignChainId)

  const { foreignBridge, foreignOmni, homeBridge, homeOmni, omniFeeManager } = {
    omniFeeManager: OmniBridgeFeeManager__factory.connect(
      contracts.omnibridgeFeeManager.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    homeOmni: HomeOmniMediator__factory.connect(
      contracts.homeOmniBridge.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    foreignOmni: HomeOmniMediator__factory.connect(
      contracts.homeOmniBridge.address[foreignConfig.chainId],
      foreignRpcProvider,
    ),
    homeBridge: HomeBridgeErcToNative__factory.connect(
      contracts.homeXdaiBridge.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    foreignBridge: HomeBridgeErcToNative__factory.connect(
      contracts.homeXdaiBridge.address[foreignConfig.chainId],
      foreignRpcProvider,
    ),
  }

  //---------------
  // foreign > Gnosis
  //---------------

  // DAI (foreign) > DAI (home) or xDAI (native token)
  if (isFromForeign && isDAI) {
    return {
      tokenOutAddress: receiveNativeToken
        ? NATIVE_TOKEN_ADDRESS
        : chainsConfig[Chains.gnosis].bridge.DAI,
      fee: await homeBridge.getHomeFee(),
      canReceiveNativeToken: true,
    }
  }

  // Native (form example ETH)
  // we use this one to detect that the token on the other side is WETH.
  if (isFromForeign && isNativeToken) {
    return {
      tokenOutAddress: chainsConfig[Chains.gnosis].bridge.wForeignNative,
      fee: await omniFeeManager.calculateFee(foreignToHomeFeeKey, tokenAddress, amount),
    }
  }

  // default to ERC20
  if (isFromForeign) {
    return {
      tokenOutAddress: await homeOmni.homeTokenAddress(tokenAddress),
      fee: await omniFeeManager.calculateFee(foreignToHomeFeeKey, tokenAddress, amount),
    }
  }

  //---------------
  // Gnosis > foreign
  //---------------

  // xDAI
  if (isFromHome && isNativeToken) {
    return {
      tokenOutAddress: chainsConfig[toChainId].bridge.DAI,
      fee: await homeBridge.getForeignFee(),
    }
  }

  // WETH > ETH or WETH
  if (isFromHome && isSameString(chainsConfig[Chains.gnosis].bridge.wForeignNative, tokenAddress)) {
    return {
      tokenOutAddress: receiveNativeToken
        ? NATIVE_TOKEN_ADDRESS
        : chainsConfig[toChainId].bridge.wForeignNative,
      canReceiveNativeToken: true,
      fee: await omniFeeManager.calculateFee(homeToForeignFeeKey, tokenAddress, amount),
    }
  }

  // default to ERC20
  if (isFromHome) {
    return {
      tokenOutAddress: await homeOmni.foreignTokenAddress(tokenAddress),
      fee: await omniFeeManager.calculateFee(homeToForeignFeeKey, tokenAddress, amount),
    }
  }

  throw Error('Invalid params')
}

const sendBridgeTx = async ({
  amount,
  bridgeAddress,
  fromChainId,
  isERC20,
  isNativeToken,
  isWETH,
  receiveNativeToken,
  signer,
  toChainId,
  tokenAddress,
}: {
  amount: BigNumberish
  bridgeAddress: string
  fromChainId: ChainsValues
  isERC20: boolean
  isNativeToken: boolean
  isWETH: boolean
  receiveNativeToken: boolean
  rpcProvider: JsonRpcBatchProvider
  sendTx: (tx: () => Promise<void>) => Promise<void>
  signer: any
  toChainId: ChainsValues
  tokenAddress: string
}) => {
  const { isFromForeign, isFromHome } = handleBridgeCommonInfo({
    fromChainId: fromChainId,
    tokenAddress: tokenAddress,
    receiveNativeToken: receiveNativeToken,
  })

  const { config: homeConfig, rpcProvider: homeRpcProvider } = getNetworkConfigAndRpcProvider(
    Chains.gnosis,
  )
  const { config: foreignConfig, rpcProvider: foreignRpcProvider } =
    getNetworkConfigAndRpcProvider(toChainId)

  const { foreignBridge, foreignOmni, homeBridge, homeOmni, omniFeeManager } = {
    omniFeeManager: OmniBridgeFeeManager__factory.connect(
      contracts.omnibridgeFeeManager.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    homeOmni: HomeOmniMediator__factory.connect(
      contracts.homeOmniBridge.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    foreignOmni: HomeOmniMediator__factory.connect(
      contracts.homeOmniBridge.address[foreignConfig.chainId],
      foreignRpcProvider,
    ),
    homeBridge: HomeBridgeErcToNative__factory.connect(
      contracts.homeXdaiBridge.address[homeConfig.chainId],
      homeRpcProvider,
    ),
    foreignBridge: HomeBridgeErcToNative__factory.connect(
      contracts.homeXdaiBridge.address[foreignConfig.chainId],
      foreignRpcProvider,
    ),
  }

  // ---------------
  // Sending tx @TODO
  // ---------------
}

export const useBridgeBalance = ({
  account,
  fromChainId,
  token,
}: {
  account: string
  fromChainId: ChainsValues
  token?: Token
}) => {
  const { readOnlyAppBatchProvider } = useWeb3ConnectedApp()

  const provider = readOnlyAppBatchProvider

  const shouldFetch = account && token && fromChainId
  return useSWR(
    shouldFetch ? [account, token, fromChainId] : null,
    async ([_account, _token, _fromChainId]) => {
      const { fromBridgeAddress, isERC20 } = handleBridgeCommonInfo({
        fromChainId: _fromChainId,
        tokenAddress: _token.address,
      })

      try {
        return fetchBalances({
          provider: provider,
          bridgeAddress: fromBridgeAddress,
          tokenAddress: _token.address,
          account: _account,
          isERC20,
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

export const useBridgeInfo = ({
  account,
  allowance,
  amount,
  fromChainId,
  receiveNativeToken = false,
  toChainId,
  token,
}: {
  account: string
  fromChainId: ChainsValues
  receiveNativeToken: boolean
  toChainId: ChainsValues
  token?: Token
  amount?: string
  allowance?: BigNumber
}) => {
  const parsedAmount = useMemo(() => {
    if (!amount || !token) {
      return ZERO_BN
    }
    try {
      return parseUnits(amount, token.decimals)
    } catch (error) {
      return ZERO_BN
    }
  }, [amount, token])

  const shouldFetch = account && token && fromChainId && toChainId

  const shouldApprove = useMemo(() => {
    if (!allowance || !parsedAmount) {
      return false
    }

    return allowance.lt(parsedAmount)
  }, [allowance, parsedAmount])

  return useSWR(
    shouldFetch ? [token, fromChainId, toChainId, receiveNativeToken, parsedAmount] : null,

    async ([_token, _fromChainId, _toChainId, _receiveNativeToken, _amount]) => {
      const { fromBridgeAddress } = handleBridgeCommonInfo({
        fromChainId: _fromChainId,
        tokenAddress: _token.address,
        receiveNativeToken: _receiveNativeToken,
      })

      try {
        return {
          ...(await getReceivedTokenInfo({
            amount: _amount,
            tokenAddress: _token.address,
            receiveNativeToken: _receiveNativeToken,
            fromChainId: _fromChainId,
            toChainId: _toChainId,
          })),
          shouldApprove,
          fromBridgeAddress,
        }
      } catch (error) {
        console.error(error)

        return {
          fromBridgeAddress,
          tokenOutAddress: undefined,
          fee: ZERO_BN,
          canReceiveNativeToken: false,
          shouldApprove,
        }
      }

      // const sendTx = getSendTx()
    },
    { suspense: false, use: [laggy] }, // use laggy to avoid the "stale" state
  )
}
