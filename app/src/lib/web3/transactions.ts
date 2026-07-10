import { type Hash, publicActions } from 'viem'

import { ChainsValues } from '@/src/constants/config/types'
import { wagmiConfig } from '@/src/providers/wagmi'

/**
 * A viem public client for `chainId`, bound to the app's wagmi config. Shared base
 * for one-off on-chain reads made outside of React (i.e. not via wagmi hooks) —
 * contract reads, balances, transaction receipts.
 */
export const getPublicClient = (chainId: ChainsValues) =>
  wagmiConfig.getClient({ chainId }).extend(publicActions)

/**
 * Fetches the mined receipt for `hash`. Throws viem's `TransactionReceiptNotFoundError`
 * when the transaction has not been mined yet — callers that want "is it mined?"
 * semantics should catch and treat the throw as "still pending".
 */
export const getTransactionReceipt = (hash: Hash, chainId: ChainsValues) =>
  getPublicClient(chainId).getTransactionReceipt({ hash })

/** Resolves once `hash` is mined (defaults to 1 confirmation), with its receipt. */
export const waitForTransactionReceipt = (hash: Hash, chainId: ChainsValues, confirmations = 1) =>
  getPublicClient(chainId).waitForTransactionReceipt({ hash, confirmations })
