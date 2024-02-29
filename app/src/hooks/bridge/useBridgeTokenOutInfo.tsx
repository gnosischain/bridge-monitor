import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { isSameString } from '@/src/utils/tools'
import { ERC20__factory, HomeOmniMediator } from '@/types/typechain'
import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ZERO_BN } from '@/src/constants/misc'
import { isNativeToken as isNativeTokenUtil } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { BigNumber } from 'ethers'

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
      tokenOutAddress: await homeOmni.homeTokenAddress(tokenAddress),
      canReceiveNativeToken: false,
    }
  }

  //---------------
  // Gnosis > foreign
  //---------------

  if (isFromHome) {
    // xDAI -> DAI
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
      tokenOutAddress: await homeOmni.foreignTokenAddress(tokenAddress),
      canReceiveNativeToken: false,
    }
  }

  throw Error('Invalid params')
}

async function getReceivedToken(token: Token, address: string, chainId: ChainsValues) {
  const provider = new JsonRpcProvider(chainsConfig[chainId].rpcUrl)
  const tokenAddress = token.address

  if (isNativeTokenUtil(tokenAddress)) {
    return provider.getBalance(address)
  } else {
    const erc20 = ERC20__factory.connect(tokenAddress, provider)
    return erc20.balanceOf(address)
  }
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
  const { address } = useWeb3Connection()
  const { tokensByNetwork } = useBridgedTokens()
  const toTokensList = tokensByNetwork[toChainId]

  const shouldFetch = tokenAddress && fromChainId && toChainId

  return useSWR(
    shouldFetch
      ? [tokenAddress, fromChainId, toChainId, receiveNativeToken, 'bridgeTokenOut']
      : null,
    async ([_tokenAddress, _fromChainId, _toChainId, _receiveNativeToken]) => {
      const tokenOutInfo = await getReceivedTokenInfo({
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

      const receivedToken = toTokensList.find((t) =>
        isSameString(t.address, tokenOutInfo?.tokenOutAddress),
      )

      let userBalanceInDestination: BigNumber | undefined = undefined

      if (receivedToken && address) {
        userBalanceInDestination =
          (await getReceivedToken(receivedToken, address, toChainId)) || ZERO_BN
      }

      return { ...tokenOutInfo, receivedToken, userBalanceInDestination }
    },
    { suspense: false },
  )
}
