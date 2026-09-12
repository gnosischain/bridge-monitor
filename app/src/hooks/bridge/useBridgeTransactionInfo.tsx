import { skipToken, useQuery } from '@tanstack/react-query'

import { chainsConfig } from '@/src/constants/config/chains'
import { ChainsValues } from '@/src/constants/config/types'
import { USDC_ETHEREUM, USDCe_GNOSIS } from '@/src/constants/misc'
import {
  handleERC20TokenFromForeign,
  handleERC20TokenFromHome,
} from '@/src/hooks/bridge/txBuilders/erc20'
import {
  handleNativeTokenFromForeign,
  handleNativeTokenFromHome,
} from '@/src/hooks/bridge/txBuilders/nativeToken'
import { type BridgeTxParts } from '@/src/hooks/bridge/txBuilders/shared'
import { handleTransmuterRelay } from '@/src/hooks/bridge/txBuilders/transmuter'
import { handleUsdsOrDaiFromForeign } from '@/src/hooks/bridge/txBuilders/usdsOrDai'
import { getBridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import { TOKEN_MODE, useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { type TxCall, getPublicClient } from '@/src/lib/web3/transactions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'

/**
 * isNativeToken && isFromForeign: use wrapAndRelayTokens (nativeOmniBridgeMediator) (no need approve: infinite approve) -> ETH -> WETH
 * isNativeToken && isFromHome && recipient: use relayTokens (homeBridgeErcToNative) (no need approve: infinite approve) -> xDAI -> DAI
 * isNativeToken && isFromHome && !recipient: use sendTransaction (plain native value transfer) (homeBridgeErcToNative) (no need approve: infinite approve) -> xDAI -> DAI
 * !isNativeToken && isFromForeign && !isDAI: use approve and relayTokens (foreignOmniMediator) (never use transfer) -> WETH -> WETH
 * !isNativeToken && isFromForeign && isDAI (receive native-xdai on home ): use approve and relayTokens (foreignBridgeErcToNative) -> DAI -> xDAI
 * !isNativeToken && isFromForeign && isDAI (receive DAI on home): use approve and relayTokens (foreignOmniMediator) -> DAI -> DAI
 * !isNativeToken && isFromHome && recipient (non compatible with ERC677/ERC827): use approve and relayTokens (homeOmniMediator) -> WETH -> WETH
 * !isNativeToken && isFromHome && !recipient (non compatible with ERC677/ERC827): use approve and transfer (from token contract) (homeOmniMediator) -> WETH -> WETH
 * !isNativeToken && isFromHome && recipient (compatible with ERC677/ERC827): use transferAndCall (without approve) (from token contract) (homeOmniMediator) -> WETH -> WETH
 * !isNativeToken && isFromHome && !recipient (compatible with ERC677/ERC827): use transferAndCall (without approve) (from token contract) (homeOmniMediator) -> WETH -> WETH
 * If I want to receive native token on foreign chain, it is possible? -> WETH -> ETH?
 *
 * Each case is built by a module under `./txBuilders`; this file only picks between them.
 */

// A gas estimate for the bridge transaction plus the call(s) that perform it. `calls` is `null`
// when there is nothing to send (zero amount or no connected account). The send layer
// (`useTransaction`) dispatches these via EOA `sendTransaction` or smart-account `sendCalls`.
type BridgeTxInfo = {
  gasLimit: bigint
  gasPrice: bigint
  calls: TxCall[] | null
}

export const getBridgeTx = async ({
  account,
  allowance,
  amount,
  fromChainId,
  receiveNativeToken,
  recipient,
  toChainId,
  toTokenAddress,
  tokenAddress,
  tokenMode,
}: {
  account: string
  amount: bigint
  allowance: bigint
  fromChainId: ChainsValues
  toChainId: ChainsValues
  tokenAddress: string
  tokenMode: TOKEN_MODE
  receiveNativeToken?: boolean
  recipient?: string
  toTokenAddress?: string
}): Promise<BridgeTxInfo> => {
  if (amount <= 0n || !account) {
    return {
      gasLimit: 0n,
      gasPrice: 0n,
      calls: null,
    }
  }

  const { isFromHome, isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })

  const isUsdc =
    isSameString(tokenAddress, USDC_ETHEREUM) || isSameString(tokenAddress, USDCe_GNOSIS)
  const isUsdsOrDai =
    isSameString(tokenAddress, chainsConfig[1].bridge.USDS) ||
    isSameString(tokenAddress, chainsConfig[1].bridge.DAI)

  const bridgeConfig = getBridgeContractConfig(fromChainId, toChainId, tokenAddress)

  const buildParts = (): Promise<BridgeTxParts> => {
    // USDS/DAI leaving Ethereum are routed by the BridgeRouter, whichever side they land on.
    if (isUsdsOrDai) {
      return handleUsdsOrDaiFromForeign({
        bridgeConfig,
        amount,
        tokenAddress,
        userAddress: account,
        recipient,
        allowance,
      })
    }

    // USDC and USDC.e both pass through the transmuter; `bridgeConfig` picks the right mediator.
    if (isUsdc) {
      return handleTransmuterRelay({
        bridgeConfig,
        amount,
        tokenAddress,
        userAddress: account,
        recipient,
        allowance,
        tokenMode,
      })
    }

    if (isNativeToken) {
      return isFromHome
        ? handleNativeTokenFromHome({
            bridgeConfig,
            amount,
            recipient,
            fromChainId,
            userAddress: account,
            toTokenAddress,
          })
        : handleNativeTokenFromForeign({
            bridgeConfig,
            amount,
            userAddress: account,
            walletAddress: recipient || account,
          })
    }

    return isFromHome
      ? handleERC20TokenFromHome({
          bridgeConfig,
          amount,
          tokenAddress,
          toChainId,
          tokenMode,
          userAddress: account,
          recipient,
          receiveNativeToken,
          allowance,
        })
      : handleERC20TokenFromForeign({
          bridgeConfig,
          amount,
          tokenAddress,
          allowance,
          tokenMode,
          recipient,
          userAddress: account,
          isDAI: isNativeBridge, // use nativeBridge for DAI
        })
  }

  const gasPrice = await getPublicClient(fromChainId).getGasPrice()
  const { calls, gasLimit } = await buildParts()

  return {
    gasLimit,
    gasPrice,
    calls,
  }
}

export const useBridgeTransactionInfo = ({
  amount,
  fromChainId,
  receiveNativeToken,
  recipient,
  toChainId,
  toToken,
  token,
  userAddress,
}: {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: bigint
  receiveNativeToken: boolean
  recipient?: string
  token: Token
  toToken?: Token
}) => {
  const { isWalletConnected, walletChainId } = useWeb3Connection()
  const isReady = isWalletConnected && walletChainId === fromChainId

  const { data: tokenMode } = useTokenMode(fromChainId, toChainId, token)
  const { data: userBalancesData } = useUserTokenBalances({
    userAddress: userAddress,
    allowanceAddress: getBridgeContractConfig(fromChainId, toChainId, token.address).address,
    chainId: fromChainId,
    tokenAddress: token.address,
  })

  const allowance = userBalancesData?.allowance
  const toTokenAddress = toToken ? toToken.address : undefined

  return useQuery({
    queryKey: [
      'bridgeTransactionInfo',
      userAddress,
      fromChainId,
      toChainId,
      token.address,
      toTokenAddress,
      amount.toString(),
      allowance?.toString(),
      recipient,
      tokenMode,
      receiveNativeToken,
    ],
    queryFn:
      isReady && allowance !== undefined
        ? () =>
            getBridgeTx({
              account: userAddress,
              amount,
              fromChainId,
              toChainId,
              tokenAddress: token.address,
              recipient,
              tokenMode,
              receiveNativeToken,
              allowance,
              toTokenAddress,
            })
        : skipToken,
    staleTime: 12_000,
    // Throw only when there is nothing to fall back on: a failed background refetch (an RPC blip
    // while the user was on another tab) keeps the last good estimate instead of swapping the
    // bridge button for an error boundary, which is how every other query on the form behaves.
    throwOnError: (_, query) => query.state.data === undefined,
  })
}
