import { type Address, encodeAbiParameters } from 'viem'

import { Chains } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import {
  type BridgeTxParts,
  estimateAndBuildAfterApproval,
  txContext,
} from '@/src/hooks/bridge/txBuilders/shared'
import { type BridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import { TOKEN_MODE } from '@/src/hooks/bridge/useTokenMode'

/**
 * Bridges USDC to the transmuter through the OmniBridge mediator's `relayTokensAndCall`, with the
 * final recipient encoded in the call data. Approves the mediator first when the allowance is
 * short.
 *
 * Both directions run this same code — USDC.e leaving Gnosis and USDC leaving Ethereum — because
 * `bridgeConfig` already resolves to the right mediator for the direction. It was previously two
 * identical functions, `handleUsdceFromHome` and `handleUsdcFromForeign`.
 */
export const handleTransmuterRelay = async ({
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
}): Promise<BridgeTxParts> => {
  const { account, bridgeAddress, client } = txContext(bridgeConfig, userAddress)
  const token = tokenAddress as Address
  const walletAddress = (recipient || userAddress) as Address

  const bytesData = encodeAbiParameters([{ type: 'address' }], [walletAddress])

  return estimateAndBuildAfterApproval(
    client,
    account,
    {
      needed: tokenMode !== 'ERC677' && amount > allowance,
      token,
      spender: bridgeAddress,
      amount,
    },
    {
      address: bridgeAddress,
      abi: bridgeConfig.abi,
      functionName: 'relayTokensAndCall',
      args: [token, contracts.Transmuter[Chains.gnosis].address, amount, bytesData],
    },
  )
}
