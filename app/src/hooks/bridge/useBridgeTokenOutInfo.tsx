import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS, USDS_ADDRESS } from '@/src/constants/config/common'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { isSameString } from '@/src/utils/tools'
import { HomeOmniMediator, HomeOmniMediator__factory } from '@/types/typechain'
import useSWR from 'swr/immutable'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Token } from '@/types/token'
import { TokenOverrideManager } from '@/src/utils/token-overrides'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { contracts } from '@/src/constants/config/contracts'
import { USDC_ETHEREUM, USDCe_GNOSIS, ZERO_ADDRESS } from '@/src/constants/misc'
import { usdcTokens } from '@/src/constants/usdcTokens'
import { xdaiToken } from '@/src/constants/xdaiToken'
/**
 * Retrieves information about the received token based on the provided parameters.
 * @param amount The amount of the token.
 * @param fromChainId The ID of the chain where the token is being sent from.
 * @param receiveNativeToken A boolean indicating whether the token is received as a native token.
 * @param toChainId The ID of the chain where the token is being sent to.
 * @param tokenAddress The address of the token.
 * @returns tokenOutAddress, fee, and canReceiveNativeToken (optional).
 * @throws Error if the parameters are invalid.
 */
const getReceivedTokenInfo = async ({
  fromChainId,
  omniBridgeInstance,
  receiveNativeToken,
  receiveUsds,
  toChainId,
  tokenAddress,
}: {
  toChainId: ChainsValues
  fromChainId: ChainsValues
  tokenAddress: string
  omniBridgeInstance: HomeOmniMediator
  receiveNativeToken: boolean
  receiveUsds: boolean
}): Promise<{ tokenOutAddress: string; canReceiveNativeToken?: boolean }> => {
  const { isDAI, isFromForeign, isFromHome, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })
  //---------------
  // Overrides
  //---------------
  if (TokenOverrideManager.isOverridden(tokenAddress)) {
    return {
      tokenOutAddress: TokenOverrideManager.getOverride(tokenAddress).tokenOutAddress,
    }
  }

  //---------------
  // foreign > Gnosis
  //---------------

  if (isFromForeign) {
    if (isDAI) {
      return {
        tokenOutAddress: NATIVE_TOKEN_ADDRESS,
      }
    }

    // Native (form example ETH)
    // we use this one to detect that the token on the other side is WETH.
    if (isNativeToken) {
      return {
        tokenOutAddress: chainsConfig[Chains.gnosis].bridge.wForeignNative,
        canReceiveNativeToken: true,
      }
    }

    // default to ERC20
    return {
      tokenOutAddress: await omniBridgeInstance.homeTokenAddress(tokenAddress),
      canReceiveNativeToken: false,
    }
  }

  //---------------
  // Gnosis > foreign
  //---------------

  if (isFromHome) {
    // xDAI -> DAI
    if (receiveUsds) {
      return {
        tokenOutAddress: USDS_ADDRESS,
      }
    }

    if (isNativeToken) {
      return {
        tokenOutAddress: chainsConfig[toChainId].bridge.DAI,
        canReceiveNativeToken: false,
      }
    }

    // WETH > ETH or WETH
    if (isSameString(chainsConfig[Chains.gnosis].bridge.wForeignNative, tokenAddress)) {
      return {
        tokenOutAddress: receiveNativeToken
          ? NATIVE_TOKEN_ADDRESS
          : chainsConfig[toChainId].bridge.wForeignNative,
        canReceiveNativeToken: false,
      }
    }

    // default to ERC20
    return {
      tokenOutAddress: await omniBridgeInstance.foreignTokenAddress(tokenAddress),
      canReceiveNativeToken: false,
    }
  }

  throw Error('Invalid params')
}

export const useBridgeTokenOutInfo = ({
  fromChainId,
  receiveNativeToken,
  receiveUsds,
  toChainId,
  token,
}: {
  receiveNativeToken: boolean
  receiveUsds: boolean
  toChainId: ChainsValues
  fromChainId: ChainsValues
  token?: Token
}) => {
  const { tokensByNetwork } = useBridgedTokens()
  const toTokensList = tokensByNetwork[toChainId]

  const shouldFetch = !!(token && fromChainId && toChainId)

  const { data } = useSWR(
    shouldFetch
      ? [token, fromChainId, toChainId, receiveNativeToken, receiveUsds, 'bridgeTokenOut']
      : null,
    async ([_token, _fromChainId, _toChainId, _receiveNativeToken, _receiveUsds]) => {
      if (
        _fromChainId === Chains.mainnet &&
        _toChainId === Chains.gnosis &&
        isSameString(_token.address, USDC_ETHEREUM)
      ) {
        return usdcTokens.usdceGnosis
      }

      if (
        _fromChainId === Chains.gnosis &&
        _toChainId === Chains.mainnet &&
        isSameString(_token.address, USDCe_GNOSIS)
      ) {
        return usdcTokens.usdcMainnet
      }

      if (_fromChainId === Chains.mainnet && isSameString(_token.address, USDS_ADDRESS)) {
        return xdaiToken
      }

      try {
        const omniBridgeInstance = HomeOmniMediator__factory.connect(
          contracts.OmniBridge.address[Chains.gnosis],
          new JsonRpcProvider(chainsConfig[Chains.gnosis].rpcUrl),
        )

        const tokenOutInfo = await getReceivedTokenInfo({
          omniBridgeInstance,
          toChainId: _toChainId,
          tokenAddress: _token.address,
          fromChainId: _fromChainId,
          receiveNativeToken: _receiveNativeToken,
          receiveUsds: _receiveUsds,
        })

        // if tokenOutInfo address is ZERO_ADDRESS is a new token on the other chain and we need to handle it
        if (tokenOutInfo.tokenOutAddress === ZERO_ADDRESS) {
          return {
            ...token,
            address: undefined,
            chainId: _toChainId,
          }
        }

        // get the token  from the list if it exists
        const receivedToken = toTokensList.find((t) =>
          isSameString(t.address, tokenOutInfo?.tokenOutAddress),
        )

        if (receivedToken) {
          return receivedToken
        }

        // if the token is not in the list we return the token with the new address
        return {
          ...token,
          address: tokenOutInfo.tokenOutAddress,
          chainId: _toChainId,
        }
      } catch (error) {
        console.error('Error fetching token out info', error)
        return null
      }
    },
    {
      suspense: false,
    },
  )

  return data as Token | undefined
}
