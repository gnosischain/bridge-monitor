import { type Abi, type Address, type Hex, erc20Abi } from 'viem'

import ERC677_abi from '@/src/abis/ERC677.json'
import { contractOn, contracts } from '@/src/constants/config/contracts'
import { ChainsValues } from '@/src/constants/config/types'
import {
  type BridgeTxParts,
  type ContractCall,
  estimateAndBuild,
  estimateAndBuildAfterApproval,
  estimateApproval,
  txContext,
} from '@/src/hooks/bridge/txBuilders/shared'
import { type BridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import { TOKEN_MODE } from '@/src/hooks/bridge/useTokenMode'
import { toCall } from '@/src/lib/web3/transactions'

/**
 * The native-token mediator on `chainId` — the contract that unwraps a bridged ERC20 back into
 * that chain's native token. Throws when the chain has none, rather than letting a missing
 * address build malformed call data.
 */
const getNativeTokenMediatorAddress = (chainId: ChainsValues): Address => {
  const mediator = contractOn(contracts.omniBridgeNativeToken, chainId)
  if (!mediator) {
    throw new Error(`No native-token mediator deployed on chain ${chainId}`)
  }
  return mediator.address
}

/**
 * Relays an ERC20 from the foreign chain to the home chain. Covers the OmniBridge mediator
 * variants — ERC677 `transferAndCall`, dedicated-ERC20, and standard `relayTokens` — as well as
 * the native (DAI) bridge path when `isDAI` is set.
 */
export const handleERC20TokenFromForeign = async ({
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
}): Promise<BridgeTxParts> => {
  const { account, bridgeAddress, client } = txContext(bridgeConfig, userAddress)
  const token = tokenAddress as Address
  const walletAddress = (recipient || userAddress) as Address

  if (isDAI) {
    const receiver = (recipient ? recipient.toLowerCase() : userAddress.toLowerCase()) as Address

    return estimateAndBuildAfterApproval(
      client,
      account,
      { needed: amount > allowance, token, spender: bridgeAddress, amount },
      {
        address: bridgeAddress,
        abi: bridgeConfig.abi,
        functionName: 'relayTokens',
        args: [receiver, amount],
      },
    )
  }

  // Never use transfer in this case. Always use relayTokens (or transferAndCall for ERC677).
  // For Dedicated ERC20 (D-ERC20) the 2-arg relayTokens(address,uint256) overload is used.
  const sendCall: ContractCall =
    tokenMode === 'D-ERC20'
      ? {
          address: bridgeAddress,
          abi: bridgeConfig.abi,
          functionName: 'relayTokens',
          args: [walletAddress, amount],
        }
      : tokenMode === 'ERC677'
        ? {
            address: token,
            abi: ERC677_abi as Abi,
            functionName: 'transferAndCall',
            args: [bridgeAddress, amount, walletAddress],
          }
        : {
            address: bridgeAddress,
            abi: bridgeConfig.abi,
            functionName: 'relayTokens',
            args: [token, walletAddress, amount],
          }

  // An ERC677 `transferAndCall` carries its own authorisation, so only the other modes can be
  // short an allowance. See `estimateAndBuildAfterApproval` for why gas follows the approval.
  const needsApproval = tokenMode !== 'ERC677' && amount > allowance

  const gasLimit = needsApproval
    ? await estimateApproval(client, account, {
        token,
        spender: bridgeAddress,
        amount,
      }).catch((error) => {
        console.log('error', error)
        return 0n
      })
    : await client.estimateContractGas({ ...sendCall, account })

  return { gasLimit, calls: [toCall(sendCall)] }
}

/**
 * Relays an ERC20 from the home chain to the foreign chain through the OmniBridge mediator.
 * ERC677 tokens use `transferAndCall` and skip the approval; other tokens approve the mediator
 * when the allowance is short and otherwise `relayTokens`. Note that when an approval is still
 * required, the returned call performs the approval rather than the relay.
 */
export const handleERC20TokenFromHome = async ({
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
}): Promise<BridgeTxParts> => {
  const { account, bridgeAddress, client } = txContext(bridgeConfig, userAddress)
  const token = tokenAddress as Address
  const walletAddress = (recipient || userAddress) as Address

  // byteData info in: https://docs.tokenbridge.net/eth-xdai-amb-bridge/multi-token-extension/transfer-weth-from-xdai-to-eth-on-mainnet
  const bytesData: Hex = receiveNativeToken
    ? `${getNativeTokenMediatorAddress(toChainId)}${walletAddress.replace('0x', '')}`
    : walletAddress

  // ERC677 => tokenAddress.transferAndCall(mediator)
  if (tokenMode === 'ERC677') {
    return estimateAndBuild(client, account, {
      address: token,
      abi: ERC677_abi as Abi,
      functionName: 'transferAndCall',
      args: [bridgeAddress, amount, bytesData],
    })
  }

  // dedicatedErc20 => mediator.relayTokens(receiver, amount)
  if (tokenMode === 'D-ERC20') {
    return estimateAndBuild(client, account, {
      address: bridgeAddress,
      abi: bridgeConfig.abi,
      functionName: 'relayTokens',
      args: [walletAddress, amount],
    })
  }

  // ERC20 — when the allowance is insufficient the returned call IS the approve (this home
  // handler differs from the foreign ones, whose tx always performs the bridge send).
  if (allowance && amount > allowance) {
    return estimateAndBuild(client, account, {
      address: token,
      abi: erc20Abi,
      functionName: 'approve',
      args: [bridgeAddress, amount],
    })
  }

  // ERC20 => mediator.relayTokens(token, receiver, amount)
  return estimateAndBuild(client, account, {
    address: bridgeAddress,
    abi: bridgeConfig.abi,
    functionName: 'relayTokens',
    args: [token, walletAddress, amount],
  })
}
