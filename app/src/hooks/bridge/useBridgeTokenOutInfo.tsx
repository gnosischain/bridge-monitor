import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { isSameString } from '@/src/utils/tools'
import { HomeOmniMediator } from '@/types/typechain'
import useSWR from 'swr'

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
export const getReceivedTokenInfo = async ({
  fromChainId,
  homeOmni,
  isDAI,
  isFromForeign,
  isFromHome,
  isNativeToken,
  receiveNativeToken,
  toChainId,
  tokenAddress,
}: {
  receiveNativeToken: boolean
  toChainId: ChainsValues
  fromChainId: ChainsValues
  tokenAddress: string
  isDAI: boolean
  isFromForeign: boolean
  isFromHome: boolean
  isNativeToken: boolean
  homeOmni: HomeOmniMediator
}): Promise<{ tokenOutAddress: string; canReceiveNativeToken?: boolean }> => {
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

  // xDAI -> DAI
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

export const useBridgeTokenOutInfo = ({
  fromChainId,
  homeOmni,
  isDAI,
  isFromForeign,
  isFromHome,
  isNativeToken,
  receiveNativeToken,
  toChainId,
  tokenAddress,
}: {
  receiveNativeToken: boolean
  toChainId: ChainsValues
  isDAI: boolean
  isFromForeign: boolean
  isFromHome: boolean
  isNativeToken: boolean
  homeOmni: HomeOmniMediator
  fromChainId: ChainsValues
  tokenAddress?: string
}) => {
  const shouldFetch = tokenAddress && fromChainId && toChainId

  return useSWR(
    shouldFetch
      ? [tokenAddress, fromChainId, toChainId, receiveNativeToken, 'bridgeTokenOut']
      : null,
    async ([_tokenAddress, _fromChainId, _toChainId, _receiveNativeToken]) => {
      return getReceivedTokenInfo({
        homeOmni,
        isDAI,
        isFromForeign,
        isFromHome,
        isNativeToken,
        receiveNativeToken: _receiveNativeToken,
        toChainId: _toChainId,
        tokenAddress: _tokenAddress,
        fromChainId: _fromChainId,
      })
    },
    { suspense: false },
  )
}
