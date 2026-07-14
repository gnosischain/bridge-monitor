import { type Hash, type TransactionReceipt } from 'viem'
import { getPublicClient, getTransactionReceipt as wagmiGetTransactionReceipt } from 'wagmi/actions'

import { ChainsValues } from '@/src/constants/config/types'
import { wagmiConfig } from '@/src/providers/wagmi'

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
  getPublicClient(wagmiConfig, { chainId }).waitForTransactionReceipt({ hash, confirmations })

/**
 * Like `waitForTransactionReceipt`, but throws if the transaction reverted — ethers
 * `tx.wait()` semantics for the write path. viem resolves normally with
 * `status: 'reverted'` instead, which callers awaiting "success" would silently
 * accept. Also throws on viem's receipt-poll timeout (180s by default).
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
