import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { type Abi, type Address, type Hex, encodeAbiParameters, erc20Abi } from 'viem'
import { Token } from '@/types/token'
import { USDC_ETHEREUM, USDCe_GNOSIS } from '@/src/constants/misc'
import ERC677_abi from '@/src/abis/ERC677.json'
import { contracts } from '@/src/constants/config/contracts'
import { TOKEN_MODE, useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import {
  type BridgeContractConfig,
  getBridgeContractConfig,
} from '@/src/hooks/bridge/useBridgeContracts'
import { type TxCall, getPublicClient, toCall } from '@/src/lib/web3/transactions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { isSameString } from '@/src/utils/tools'
import { TRANSMUTER_ADDRESS } from '@/src/constants/misc'
import { chainsConfig } from '@/src/constants/config/chains'
import { USDS_ADDRESS } from '@/src/constants/config/common'

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
 */

/**
 * Wraps and relays a native token from the foreign chain to the home chain (e.g. ETH -> WETH)
 * through the native-token mediator's `wrapAndRelayTokens`. The amount is sent as native value,
 * so no allowance is required. Returns a gas estimate and a function that submits the transaction.
 */
const handleNativeTokenFromForeign = async ({
  amount,
  bridgeConfig,
  userAddress,
  walletAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  userAddress: string
  walletAddress: string
}): Promise<{ gasLimit: bigint; calls: TxCall[] }> => {
  const client = getPublicClient(bridgeConfig.chainId)
  const account = userAddress as Address
  const address = bridgeConfig.address as Address
  // single-arg `wrapAndRelayTokens(address)` overload; the native token is sent as value
  const args = [walletAddress as Address] as const

  const gasLimit = await client.estimateContractGas({
    address,
    abi: bridgeConfig.abi,
    functionName: 'wrapAndRelayTokens',
    args,
    value: amount,
    account,
  })

  return {
    gasLimit,
    calls: [
      toCall({
        address,
        abi: bridgeConfig.abi,
        functionName: 'wrapAndRelayTokens',
        args,
        value: amount,
      }),
    ],
  }
}

/**
 * Relays the home chain's native token (xDAI) to the foreign chain through the xDAI bridge — or,
 * when the destination token is USDS, through the dedicated USDS deposit contract. The amount is
 * sent as native value, so no allowance is required. Returns a gas estimate and a function that
 * submits the transaction.
 */
const handleNativeTokenFromHome = async ({
  amount,
  bridgeConfig,
  fromChainId,
  recipient,
  toTokenAddress,
  userAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  userAddress: string
  fromChainId: ChainsValues
  recipient?: string
  toTokenAddress?: string
}): Promise<{ gasLimit: bigint; calls: TxCall[] }> => {
  const client = getPublicClient(fromChainId)
  const account = userAddress as Address

  // USDS is deposited through the dedicated USDSDeposit contract, not the xDAI bridge.
  if (toTokenAddress && isSameString(toTokenAddress, USDS_ADDRESS)) {
    const usdsDepositAddress = contracts.USDSDeposit.address[fromChainId]
    if (!usdsDepositAddress) {
      throw new Error('USDSDeposit address not configured for this chain')
    }

    const address = usdsDepositAddress as Address
    const abi = contracts.USDSDeposit.abi
    const args = [(recipient || userAddress) as Address] as const

    const gasLimit = await client.estimateContractGas({
      address,
      abi,
      functionName: 'relayTokens',
      args,
      value: amount,
      account,
    })

    return {
      gasLimit,
      calls: [toCall({ address, abi, functionName: 'relayTokens', args, value: amount })],
    }
  }

  const bridgeAddress = bridgeConfig.address as Address

  // With a recipient → HomeBridgeErcToNative.relayTokens(receiver) (payable; xDAI sent as value).
  if (recipient) {
    const args = [recipient as Address] as const

    const gasLimit = await client.estimateContractGas({
      address: bridgeAddress,
      abi: bridgeConfig.abi,
      functionName: 'relayTokens',
      args,
      value: amount,
      account,
    })

    return {
      gasLimit,
      calls: [
        toCall({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokens',
          args,
          value: amount,
        }),
      ],
    }
  }

  // Without a recipient → plain value transfer to the bridge address.
  const gasLimit = await client.estimateGas({
    account,
    to: bridgeAddress,
    value: amount,
  })

  return {
    gasLimit,
    calls: [{ to: bridgeAddress, value: amount }],
  }
}

/**
 * Relays an ERC20 from the foreign chain to the home chain. Covers the OmniBridge mediator
 * variants — ERC677 `transferAndCall`, dedicated-ERC20, and standard `relayTokens` — as well as
 * the native (DAI) bridge path when `isDAI` is set. Returns a gas estimate and a function that
 * submits the transaction.
 */
const handleERC20TokenFromForeign = async ({
  allowance,
  amount,
  bridgeConfig,
  isDAI,
  recipient,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  tokenAddress: string
  allowance: bigint
  tokenMode: TOKEN_MODE
  recipient: string | undefined
  userAddress: string
  isDAI?: boolean
}): Promise<{ gasLimit: bigint; calls: TxCall[] }> => {
  // Quick fix to avoid useBridgeValidations to error when an approval is needed.
  // If an approval is needed the gasLimit should be calculated for the approval operation and not for the bridge operation.
  // If that does not happen the gas estimate would revert because the allowance is not enough.
  //
  // TODO: If an approval is needed, "gasLimit" will be set with the value the approval operation will take.
  // But "tx" will have the bridge operation. It would be good to solve this inconsistency.
  // And then remove the useApproval hook and call the approve using the tx function returned by this function.

  const client = getPublicClient(bridgeConfig.chainId)
  const account = userAddress as Address
  const bridgeAddress = bridgeConfig.address as Address
  const token = tokenAddress as Address
  const walletAddress = (recipient || userAddress) as Address
  const isDedicatedERC20 = tokenMode === 'D-ERC20'
  const isERC677 = tokenMode === 'ERC677'

  if (isDAI) {
    const receiver = (recipient ? recipient.toLowerCase() : userAddress.toLowerCase()) as Address
    const relayArgs = [receiver, amount] as const

    const gasLimit =
      amount > allowance
        ? await client.estimateContractGas({
            address: token,
            abi: erc20Abi,
            functionName: 'approve',
            args: [bridgeAddress, amount],
            account,
          })
        : await client.estimateContractGas({
            address: bridgeAddress,
            abi: bridgeConfig.abi,
            functionName: 'relayTokens',
            args: relayArgs,
            account,
          })

    return {
      gasLimit,
      calls: [
        toCall({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokens',
          args: relayArgs,
        }),
      ],
    }
  }

  // Never use transfer in this case. Always use relayTokens (or transferAndCall for ERC677).
  // For Dedicated ERC20 (D-ERC20) the 2-arg relayTokens(address,uint256) overload is used.
  let gasLimit: bigint
  if (!isERC677 && amount > allowance) {
    try {
      gasLimit = await client.estimateContractGas({
        address: token,
        abi: erc20Abi,
        functionName: 'approve',
        args: [bridgeAddress, amount],
        account,
      })
    } catch (error) {
      console.log('error', error)
      gasLimit = 0n
    }
  } else if (isERC677) {
    gasLimit = await client.estimateContractGas({
      address: token,
      abi: ERC677_abi as Abi,
      functionName: 'transferAndCall',
      args: [bridgeAddress, amount, walletAddress],
      account,
    })
  } else {
    gasLimit = isDedicatedERC20
      ? await client.estimateContractGas({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokens',
          args: [walletAddress, amount],
          account,
        })
      : await client.estimateContractGas({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokens',
          args: [token, walletAddress, amount],
          account,
        })
  }

  return {
    gasLimit,
    calls: [
      isDedicatedERC20
        ? toCall({
            address: bridgeAddress,
            abi: bridgeConfig.abi,
            functionName: 'relayTokens',
            args: [walletAddress, amount],
          })
        : isERC677
          ? toCall({
              address: token,
              abi: ERC677_abi as Abi,
              functionName: 'transferAndCall',
              args: [bridgeAddress, amount, walletAddress],
            })
          : toCall({
              address: bridgeAddress,
              abi: bridgeConfig.abi,
              functionName: 'relayTokens',
              args: [token, walletAddress, amount],
            }),
    ],
  }
}

/**
 * Relays an ERC20 from the home chain to the foreign chain through the OmniBridge mediator.
 * ERC677 tokens use `transferAndCall` and skip the approval; other tokens approve the mediator
 * when the allowance is short and otherwise `relayTokens`. Returns a gas estimate and a function
 * that submits the transaction — note that when an approval is still required, that function
 * performs the approval rather than the relay.
 */
const handleERC20TokenFromHome = async ({
  allowance,
  amount,
  bridgeConfig,
  receiveNativeToken,
  recipient,
  toChainId,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  tokenAddress: string
  tokenMode: TOKEN_MODE
  userAddress: string
  toChainId: ChainsValues
  recipient?: string
  receiveNativeToken?: boolean
  allowance?: bigint
}): Promise<{ gasLimit: bigint; calls: TxCall[] }> => {
  // Here we have two cases. If the token is compatible with ERC677/ERC827 we should use transferAndCall method and avoid the approve step.
  const client = getPublicClient(bridgeConfig.chainId)
  const account = userAddress as Address
  const bridgeAddress = bridgeConfig.address as Address
  const token = tokenAddress as Address
  const isERC677 = tokenMode === 'ERC677'
  const isDedicatedERC20 = tokenMode === 'D-ERC20'

  const walletAddress = (recipient || userAddress) as Address

  // byteData info in: https://docs.tokenbridge.net/eth-xdai-amb-bridge/multi-token-extension/transfer-weth-from-xdai-to-eth-on-mainnet
  const bytesData: Hex = receiveNativeToken
    ? (`${contracts.omniBridgeNativeToken.address[toChainId]}${walletAddress.replace('0x', '')}` as Hex)
    : walletAddress

  // ERC20 => tokenAddress.approve(mediator, amount) => mediator.relayTokens(received, amount)
  // ERC677 =>  tokenAddress.transferAndCall(mediator)
  // dedicatedErc20 => mediator.relayTokens(received, amount)

  if (isERC677) {
    const args = [bridgeAddress, amount, bytesData] as const
    return {
      gasLimit: await client.estimateContractGas({
        address: token,
        abi: ERC677_abi as Abi,
        functionName: 'transferAndCall',
        args,
        account,
      }),
      calls: [
        toCall({ address: token, abi: ERC677_abi as Abi, functionName: 'transferAndCall', args }),
      ],
    }
  }

  if (isDedicatedERC20) {
    const args = [walletAddress, amount] as const
    return {
      gasLimit: await client.estimateContractGas({
        address: bridgeAddress,
        abi: bridgeConfig.abi,
        functionName: 'relayTokens',
        args,
        account,
      }),
      calls: [
        toCall({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokens',
          args,
        }),
      ],
    }
  }

  // ERC20 — when the allowance is insufficient the returned call IS the approve (this home
  // handler differs from the foreign ones, whose tx always performs the bridge send).
  if (allowance && amount > allowance) {
    const args = [bridgeAddress, amount] as const
    return {
      gasLimit: await client.estimateContractGas({
        address: token,
        abi: erc20Abi,
        functionName: 'approve',
        args,
        account,
      }),
      calls: [toCall({ address: token, abi: erc20Abi, functionName: 'approve', args })],
    }
  }

  const relayArgs = [token, (recipient || walletAddress) as Address, amount] as const
  return {
    gasLimit: await client.estimateContractGas({
      address: bridgeAddress,
      abi: bridgeConfig.abi,
      functionName: 'relayTokens',
      args: relayArgs,
      account,
    }),
    calls: [
      toCall({
        address: bridgeAddress,
        abi: bridgeConfig.abi,
        functionName: 'relayTokens',
        args: relayArgs,
      }),
    ],
  }
}

/**
 * Bridges USDC.e from the home chain to the transmuter through the OmniBridge mediator's
 * `relayTokensAndCall`, with the final recipient encoded in the call data. Approves the mediator
 * first when the allowance is short. Returns a gas estimate and a function that submits the
 * transaction.
 */
const handleUsdceFromHome = async ({
  allowance,
  amount,
  bridgeConfig,
  recipient,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  tokenAddress: string
  allowance: bigint
  tokenMode: TOKEN_MODE
  recipient: string | undefined
  userAddress: string
}): Promise<{ gasLimit: bigint; calls: TxCall[] }> => {
  // Quick fix to avoid useBridgeValidations to error when an approval is needed.
  // If an approval is needed the gasLimit should be calculated for the approval operation and not for the bridge operation.
  // If that does not happen the gas estimate would revert because the allowance is not enough.
  //
  // TODO: If an approval is needed, "gasLimit" will be set with the value the approval operation will take.
  // But "tx" will have the bridge operation. It would be good to solve this inconsistency.
  // And then remove the useApproval hook and call the approve using the tx function returned by this function.

  const client = getPublicClient(bridgeConfig.chainId)
  const account = userAddress as Address
  const bridgeAddress = bridgeConfig.address as Address
  const token = tokenAddress as Address
  const walletAddress = recipient || userAddress
  const isERC677 = tokenMode === 'ERC677'

  const bytesData = encodeAbiParameters([{ type: 'address' }], [walletAddress as Address])
  const relayArgs = [token, TRANSMUTER_ADDRESS as Address, amount, bytesData] as const

  const gasLimit =
    !isERC677 && amount > allowance
      ? await client.estimateContractGas({
          address: token,
          abi: erc20Abi,
          functionName: 'approve',
          args: [bridgeAddress, amount],
          account,
        })
      : await client.estimateContractGas({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokensAndCall',
          args: relayArgs,
          account,
        })

  return {
    gasLimit,
    calls: [
      toCall({
        address: bridgeAddress,
        abi: bridgeConfig.abi,
        functionName: 'relayTokensAndCall',
        args: relayArgs,
      }),
    ],
  }
}

/**
 * Bridges USDC from the foreign chain to the transmuter through the OmniBridge mediator's
 * `relayTokensAndCall`, with the final recipient encoded in the call data. Approves the mediator
 * first when the allowance is short. Returns a gas estimate and a function that submits the
 * transaction.
 */
const handleUsdcFromForeign = async ({
  allowance,
  amount,
  bridgeConfig,
  recipient,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  tokenAddress: string
  allowance: bigint
  tokenMode: TOKEN_MODE
  recipient: string | undefined
  userAddress: string
}): Promise<{ gasLimit: bigint; calls: TxCall[] }> => {
  // Quick fix to avoid useBridgeValidations to error when an approval is needed.
  // If an approval is needed the gasLimit should be calculated for the approval operation and not for the bridge operation.
  // If that does not happen the gas estimate would revert because the allowance is not enough.
  //
  // TODO: If an approval is needed, "gasLimit" will be set with the value the approval operation will take.
  // But "tx" will have the bridge operation. It would be good to solve this inconsistency.
  // And then remove the useApproval hook and call the approve using the tx function returned by this function.

  const client = getPublicClient(bridgeConfig.chainId)
  const account = userAddress as Address
  const bridgeAddress = bridgeConfig.address as Address
  const token = tokenAddress as Address
  const walletAddress = recipient || userAddress
  const isERC677 = tokenMode === 'ERC677'

  const bytesData = encodeAbiParameters([{ type: 'address' }], [walletAddress as Address])
  const relayArgs = [token, TRANSMUTER_ADDRESS as Address, amount, bytesData] as const

  const gasLimit =
    !isERC677 && amount > allowance
      ? await client.estimateContractGas({
          address: token,
          abi: erc20Abi,
          functionName: 'approve',
          args: [bridgeAddress, amount],
          account,
        })
      : await client.estimateContractGas({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokensAndCall',
          args: relayArgs,
          account,
        })

  return {
    gasLimit,
    calls: [
      toCall({
        address: bridgeAddress,
        abi: bridgeConfig.abi,
        functionName: 'relayTokensAndCall',
        args: relayArgs,
      }),
    ],
  }
}

/**
 * Relays DAI or USDS from the foreign chain through the BridgeRouter's `relayTokens`. Approves the
 * router first when the allowance is short. Returns a gas estimate and a function that submits the
 * transaction.
 */
const handleUsdsOrDaiFromForeign = async ({
  allowance,
  amount,
  bridgeConfig,
  recipient,
  tokenAddress,
  userAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  tokenAddress: string
  allowance: bigint
  recipient: string | undefined
  userAddress: string
}): Promise<{ gasLimit: bigint; calls: TxCall[] }> => {
  const client = getPublicClient(bridgeConfig.chainId)
  const account = userAddress as Address
  const bridgeAddress = bridgeConfig.address as Address
  const receiver = (recipient ? recipient.toLowerCase() : userAddress.toLowerCase()) as Address
  const relayArgs = [tokenAddress as Address, receiver, amount] as const

  // With insufficient allowance the relayTokens estimate would revert (the bridge pulls the
  // token), so gas is estimated for the approval instead — the button routes through the
  // approve step first, and SWR re-runs with the fresh allowance before the bridge send.
  const gasLimit =
    amount > allowance
      ? await client.estimateContractGas({
          address: tokenAddress as Address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [bridgeAddress, amount],
          account,
        })
      : await client.estimateContractGas({
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokens',
          args: relayArgs,
          account,
        })

  return {
    gasLimit,
    calls: [
      toCall({
        address: bridgeAddress,
        abi: bridgeConfig.abi,
        functionName: 'relayTokens',
        args: relayArgs,
      }),
    ],
  }
}

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
  // balance,
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
  balance: bigint
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

  const isUsdcEth = isSameString(tokenAddress, USDC_ETHEREUM)
  const isUsdceGnosis = isSameString(tokenAddress, USDCe_GNOSIS)
  const isUsdsEth = isSameString(tokenAddress, chainsConfig[1].bridge.USDS)
  const isDaiEth = isSameString(tokenAddress, chainsConfig[1].bridge.DAI)

  const gasPrice = await getPublicClient(fromChainId).getGasPrice()
  const { calls, gasLimit } =
    isUsdsEth || isDaiEth
      ? await handleUsdsOrDaiFromForeign({
          bridgeConfig: getBridgeContractConfig(fromChainId, toChainId, tokenAddress),
          amount,
          tokenAddress,
          userAddress: account,
          recipient,
          allowance,
        })
      : isUsdceGnosis
        ? await handleUsdceFromHome({
            bridgeConfig: getBridgeContractConfig(fromChainId, toChainId, tokenAddress),
            amount,
            tokenAddress,
            userAddress: account,
            recipient,
            allowance,
            tokenMode,
          })
        : isUsdcEth
          ? await handleUsdcFromForeign({
              bridgeConfig: getBridgeContractConfig(fromChainId, toChainId, tokenAddress),
              amount,
              tokenAddress,
              allowance,
              tokenMode,
              recipient,
              userAddress: account,
            })
          : isNativeToken
            ? isFromHome
              ? await handleNativeTokenFromHome({
                  bridgeConfig: getBridgeContractConfig(fromChainId, toChainId, tokenAddress),
                  amount,
                  recipient,
                  fromChainId,
                  userAddress: account,
                  toTokenAddress,
                })
              : await handleNativeTokenFromForeign({
                  bridgeConfig: getBridgeContractConfig(fromChainId, toChainId, tokenAddress),
                  amount,
                  userAddress: account,
                  walletAddress: recipient || account,
                })
            : isFromHome
              ? await handleERC20TokenFromHome({
                  bridgeConfig: getBridgeContractConfig(fromChainId, toChainId, tokenAddress),
                  amount,
                  tokenAddress,
                  toChainId,
                  tokenMode,
                  userAddress: account,
                  recipient,
                  receiveNativeToken,
                  allowance,
                })
              : await handleERC20TokenFromForeign({
                  bridgeConfig: getBridgeContractConfig(fromChainId, toChainId, tokenAddress),
                  amount,
                  tokenAddress,
                  allowance,
                  tokenMode,
                  recipient,
                  userAddress: account,
                  isDAI: isNativeBridge, // use nativeBridge for DAI
                })

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

  const toTokenAddress = toToken ? toToken.address : undefined

  return useSWR(
    isReady && userBalancesData
      ? [
          'transactionInfo',
          token,
          fromChainId,
          toChainId,
          amount,
          recipient,
          tokenMode,
          receiveNativeToken,
          toTokenAddress,
        ]
      : null,
    async ([
      ,
      _token,
      _fromChainId,
      _toChainId,
      _amount,
      _recipient,
      _tokenMode,
      _receiveNativeToken,
      _toTokenAddress,
    ]) => {
      const { calls, gasLimit, gasPrice } = await getBridgeTx({
        account: userAddress,
        amount: _amount,
        fromChainId: _fromChainId,
        toChainId: _toChainId,
        tokenAddress: _token.address,
        recipient: _recipient,
        tokenMode: _tokenMode,
        receiveNativeToken: _receiveNativeToken,
        allowance: userBalancesData!.allowance,
        balance: userBalancesData!.balance,
        toTokenAddress: _toTokenAddress,
      })

      return {
        gasLimit,
        gasPrice,
        calls,
      }
    },
  )
}
