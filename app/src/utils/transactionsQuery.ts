import { isAddress } from 'viem'

import { BridgeDirection, BridgesValues } from '@/src/constants/config/bridges'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { msToSeconds } from '@/src/utils/date'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { isTransactionHash } from '@/src/utils/tools'
import { EnvioQueryArgs, TxsInMemoryFilters } from '@/src/utils/transactions'
import { getValidatorByName } from '@/src/utils/validators'

// The explorer fetches a single page of this size; there is no incremental pagination yet.
// @todo revisit if the cap ever truncates a result set users care about.
const PAGE_SIZE = 500

// Every dropdown offers an "All ..." entry meaning "do not filter on this field".
export const isAllOption = (value: string) => value.startsWith('All')

const validatorAddress = (validatorName: string, bridge: BridgesValues) => {
  if (!validatorName || isAllOption(validatorName)) return undefined

  return getValidatorByName(validatorName, bridge)?.address.toLowerCase()
}

export type TransactionsQuery = {
  // `undefined` when the filters produce no clause at all: there is nothing to search for, so the
  // caller leaves the query idle rather than asking the indexer for an unfiltered page.
  query?: EnvioQueryArgs
  inMemoryFilters: TxsInMemoryFilters
}

/**
 * Translates the explorer's UI filters into an Envio query. Pure and synchronous: cheap enough to
 * run on every render, which is what lets the hook derive the query instead of syncing it in state.
 *
 * `resolvedAddress` is the address a `.gno` name resolved to, when the hash field holds one.
 */
export const buildTransactionsQuery = (
  filters: TransactionFilter,
  resolvedAddress?: string | null,
): TransactionsQuery => {
  const where: Array<Record<string, unknown>> = []

  if (filters.hash) {
    // An unresolved `.gno` name falls through as-is and matches nothing, which is the intended
    // "no results" for a name nobody owns.
    const hash = (resolvedAddress ?? filters.hash).toLowerCase()

    if (isTransactionHash(hash)) {
      where.push({ transactionHash: { _eq: hash } })
    } else if (isAddress(hash) || isValidDomainName(filters.hash)) {
      where.push({ _or: [{ initiator: { _eq: hash } }, { receiver: { _eq: hash } }] })
    }
  }

  if (filters.bridge && !isAllOption(filters.bridge)) {
    where.push({
      bridgeType: { _eq: filters.bridge.toUpperCase().includes('XDAI') ? 'XDAI' : 'AMB' },
    })
  }

  if (filters.bridgeDirection === BridgeDirection.gnosis2mainnet) {
    where.push({ initiatorNetwork: { _eq: 100 } })
  } else if (filters.bridgeDirection === BridgeDirection.mainnet2gnosis) {
    where.push({ initiatorNetwork: { _eq: 1 } })
  }

  if (filters.startTimestamp) {
    where.push({ timestamp: { _gte: msToSeconds(filters.startTimestamp.getTime()) } })
  }

  if (filters.endTimestamp) {
    where.push({ timestamp: { _lte: msToSeconds(filters.endTimestamp.getTime()) } })
  }

  // The indexer cannot filter on the nested validations/execution rows, so "signed by" and
  // "executed by" are applied to the page once it has been fetched (see `fetchTransactions`).
  const bridge = filters.bridge.toUpperCase() as BridgesValues

  return {
    query: where.length
      ? { where: { _and: where }, order_by: [{ timestamp: 'desc' }], limit: PAGE_SIZE, offset: 0 }
      : undefined,
    inMemoryFilters: {
      validator: validatorAddress(filters.signedBy, bridge),
      executor: validatorAddress(filters.executedBy, bridge),
    },
  }
}
