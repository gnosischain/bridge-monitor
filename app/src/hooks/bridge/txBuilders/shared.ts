import { type Abi, type Address, erc20Abi } from 'viem'

import { type BridgeContractConfig } from '@/src/hooks/bridge/useBridgeContracts'
import { type TxCall, getPublicClient, toCall } from '@/src/lib/web3/transactions'

/**
 * What every builder returns: a gas estimate plus the call(s) that perform the bridge send.
 * `useTransaction` dispatches the calls via EOA `sendTransaction` or smart-account `sendCalls`.
 */
export type BridgeTxParts = { gasLimit: bigint; calls: TxCall[] }

/**
 * A contract call described once. Both the gas estimate and the encoded call are derived from the
 * same description, so the two can't drift apart.
 */
export type ContractCall = {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

type Client = ReturnType<typeof getPublicClient>

/** The three values every builder derives from its inputs before doing anything else. */
export const txContext = (bridgeConfig: BridgeContractConfig, userAddress: string) => ({
  client: getPublicClient(bridgeConfig.chainId),
  account: userAddress as Address,
  bridgeAddress: bridgeConfig.address as Address,
})

/** Estimates gas for `call` and returns it alongside the call, ready to send. */
export const estimateAndBuild = async (
  client: Client,
  account: Address,
  call: ContractCall,
): Promise<BridgeTxParts> => ({
  gasLimit: await client.estimateContractGas({ ...call, account }),
  calls: [toCall(call)],
})

/** Gas for the ERC20 approval the bridge needs before it can pull `amount`. */
export const estimateApproval = (
  client: Client,
  account: Address,
  { amount, spender, token }: { token: Address; spender: Address; amount: bigint },
) =>
  client.estimateContractGas({
    address: token,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
    account,
  })

/**
 * `estimateAndBuild` for a call the bridge can only make once it holds an allowance.
 *
 * When the allowance is short the bridge call's own estimate would revert — it pulls the token —
 * so gas is estimated for the approval the user has to do first. The returned call is still the
 * bridge call: the form routes through the approve step, and since the allowance is part of the
 * query key the estimate is redone against the fresh allowance before the send.
 */
export const estimateAndBuildAfterApproval = async (
  client: Client,
  account: Address,
  approval: { needed: boolean; token: Address; spender: Address; amount: bigint },
  call: ContractCall,
): Promise<BridgeTxParts> => ({
  gasLimit: approval.needed
    ? await estimateApproval(client, account, approval)
    : await client.estimateContractGas({ ...call, account }),
  calls: [toCall(call)],
})
