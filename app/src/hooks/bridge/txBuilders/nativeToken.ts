import { type Address } from 'viem'

import { USDS_ADDRESS } from '@/src/constants/config/common'
import { contractOn, contracts } from '@/src/constants/config/contracts'
import { ChainsValues } from '@/src/constants/config/types'
import {
  type BridgeTxParts,
  estimateAndBuild,
  txContext,
} from '@/src/hooks/bridge/txBuilders/shared'
import { type BridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import { isSameString } from '@/src/utils/tools'

/**
 * Wraps and relays a native token from the foreign chain to the home chain (e.g. ETH -> WETH)
 * through the native-token mediator's `wrapAndRelayTokens`. The amount is sent as native value,
 * so no allowance is required.
 */
export const handleNativeTokenFromForeign = async ({
  amount,
  bridgeConfig,
  userAddress,
  walletAddress,
}: {
  bridgeConfig: BridgeContractConfig
  amount: bigint
  userAddress: string
  walletAddress: string
}): Promise<BridgeTxParts> => {
  const { account, bridgeAddress, client } = txContext(bridgeConfig, userAddress)

  return estimateAndBuild(client, account, {
    address: bridgeAddress,
    abi: bridgeConfig.abi,
    // single-arg `wrapAndRelayTokens(address)` overload; the native token is sent as value
    functionName: 'wrapAndRelayTokens',
    args: [walletAddress as Address],
    value: amount,
  })
}

/**
 * Relays the home chain's native token (xDAI) to the foreign chain through the xDAI bridge — or,
 * when the destination token is USDS, through the dedicated USDS deposit contract. The amount is
 * sent as native value, so no allowance is required.
 */
export const handleNativeTokenFromHome = async ({
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
}): Promise<BridgeTxParts> => {
  const { account, bridgeAddress, client } = txContext(bridgeConfig, userAddress)

  // USDS is deposited through the dedicated USDSDeposit contract, not the xDAI bridge.
  if (toTokenAddress && isSameString(toTokenAddress, USDS_ADDRESS)) {
    const usdsDeposit = contractOn(contracts.USDSDeposit, fromChainId)
    if (!usdsDeposit) {
      throw new Error('USDSDeposit address not configured for this chain')
    }

    return estimateAndBuild(client, account, {
      ...usdsDeposit,
      functionName: 'relayTokens',
      args: [(recipient || userAddress) as Address],
      value: amount,
    })
  }

  // With a recipient → HomeBridgeErcToNative.relayTokens(receiver) (payable; xDAI sent as value).
  if (recipient) {
    return estimateAndBuild(client, account, {
      address: bridgeAddress,
      abi: bridgeConfig.abi,
      functionName: 'relayTokens',
      args: [recipient as Address],
      value: amount,
    })
  }

  // Without a recipient → plain value transfer to the bridge address, which has no ABI to
  // estimate against.
  return {
    gasLimit: await client.estimateGas({ account, to: bridgeAddress, value: amount }),
    calls: [{ to: bridgeAddress, value: amount }],
  }
}
