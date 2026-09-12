import { type Address } from 'viem'

import {
  type BridgeTxParts,
  estimateAndBuildAfterApproval,
  txContext,
} from '@/src/hooks/bridge/txBuilders/shared'
import { type BridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'

/**
 * Relays DAI or USDS from the foreign chain through the BridgeRouter's `relayTokens`. Approves
 * the router first when the allowance is short.
 */
export const handleUsdsOrDaiFromForeign = async ({
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
}): Promise<BridgeTxParts> => {
  const { account, bridgeAddress, client } = txContext(bridgeConfig, userAddress)
  const token = tokenAddress as Address
  const receiver = (recipient ? recipient.toLowerCase() : userAddress.toLowerCase()) as Address

  return estimateAndBuildAfterApproval(
    client,
    account,
    { needed: amount > allowance, token, spender: bridgeAddress, amount },
    {
      address: bridgeAddress,
      abi: bridgeConfig.abi,
      functionName: 'relayTokens',
      args: [token, receiver, amount],
    },
  )
}
