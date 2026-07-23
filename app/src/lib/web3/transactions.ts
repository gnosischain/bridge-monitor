import {
  type Abi,
  type Address,
  type Hash,
  type Hex,
  type TransactionReceipt,
  encodeFunctionData,
} from 'viem'
import {
  getPublicClient as wagmiGetPublicClient,
  getTransactionReceipt as wagmiGetTransactionReceipt,
} from 'wagmi/actions'

import { ChainsValues } from '@/src/constants/config/types'
import { wagmiConfig } from '@/src/providers/wagmi'

/**
 * A single low-level call — the common shape both an EOA `sendTransaction` and a smart-account
 * `sendCalls` (EIP-5792) can dispatch. Producers build these instead of pre-baked `writeContract`
 * thunks so the send layer (see `useTransaction`) can choose the right path per wallet.
 */
export type TxCall = { to: Address; data?: Hex; value?: bigint }

/**
 * Encodes a contract write into a `TxCall`. The `writeContract`-style `{ address, abi, functionName,
 * args }` shape maps to `{ to, data }` via `encodeFunctionData`, so a producer can describe a call
 * without committing to how it's submitted.
 */
export const toCall = ({
  abi,
  address,
  args,
  functionName,
  value,
}: {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}): TxCall => ({
  to: address,
  data: encodeFunctionData({ abi, functionName, args }),
  value,
})

/**
 * The wagmi/viem public client for `chainId`, resolved from the shared wagmi config.
 * A thin `(chainId)` wrapper over wagmi's `(config, { chainId })` form so callers (e.g.
 * `ClaimButton`) don't repeat the config plumbing.
 */
export const getPublicClient = (chainId: ChainsValues) =>
  wagmiGetPublicClient(wagmiConfig, { chainId })

/**
 * Fetches the mined receipt for `hash`. Throws viem's `TransactionReceiptNotFoundError`
 * when the transaction has not been mined yet — callers that want "is it mined?"
 * semantics should catch and treat the throw as "still pending".
 */
export const getTransactionReceipt = (hash: Hash, chainId: ChainsValues) =>
  wagmiGetTransactionReceipt(wagmiConfig, { hash, chainId })

/**
 * Resolves once `hash` is mined (defaults to 1 confirmation), with its receipt.
 *
 * Deliberately the viem action, not wagmi's `waitForTransactionReceipt`: wagmi's discards a
 * reverted receipt — two extra RPCs to synthesize a revert reason, then a plain `Error` — while
 * callers here need the reverted receipt back to report failure. wagmi's `timeout: 0` default
 * also waits forever, where viem's 180s default throws on stuck transactions.
 */
export const waitForTransactionReceipt = (hash: Hash, chainId: ChainsValues, confirmations = 1) =>
  getPublicClient(chainId).waitForTransactionReceipt({ hash, confirmations })

/**
 * Like `waitForTransactionReceipt`, but **throws if the transaction reverted**. The plain wait
 * resolves normally with `status: 'reverted'`, which a caller awaiting "success" would silently
 * accept — so write flows use this to turn a revert into a rejected promise. Also throws on the
 * receipt-poll timeout (180s by default).
 */
export const waitForMinedReceipt = async (
  hash: Hash,
  chainId: ChainsValues,
): Promise<TransactionReceipt> => {
  const receipt = await waitForTransactionReceipt(hash, chainId)
  if (receipt.status === 'reverted') {
    throw new Error(`Transaction reverted: ${hash}`)
  }
  return receipt
}
