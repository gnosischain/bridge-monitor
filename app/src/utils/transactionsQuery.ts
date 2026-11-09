import differenceInDays from 'date-fns/differenceInDays'
import { isAddress } from 'viem'

import { BridgeDirection, Bridges, BridgesValues } from '@/src/constants/config/bridges'
import { ALL_VALIDATORS_OPTION } from '@/src/constants/filters'
import { MAX_DAYS_TO_FILTER } from '@/src/constants/misc'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { msToSeconds } from '@/src/utils/date'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { isTransactionHash } from '@/src/utils/tools'
import { EnvioQueryArgs } from '@/src/utils/transactions'
import { getValidatorByName } from '@/src/utils/validators'

// The explorer fetches a single page of this size; there is no incremental pagination yet.
// @todo revisit if the cap ever truncates a result set users care about.
const PAGE_SIZE = 500

/** With no bridge selected, the validator's address on each bridge: the same operators run both. */
const validatorAddresses = (validatorName: string, bridge: BridgesValues | '') => {
  if (!validatorName || validatorName === ALL_VALIDATORS_OPTION) return []

  return (bridge ? [bridge] : [Bridges.xdai, Bridges.amb])
    .map((bridgeValue) => getValidatorByName(validatorName, bridgeValue)?.address.toLowerCase())
    .filter((address): address is string => !!address)
}

/**
 * A single page cannot represent a range of more than `MAX_DAYS_TO_FILTER` days: the indexer would
 * answer that scan with the newest `PAGE_SIZE` transactions and the list would show them as the
 * complete result. Such a range is refused instead. The date picker only ever selects a single day,
 * so this is the backstop for a range built anywhere else.
 */
const isRangeTooWide = ({ endTimestamp, startTimestamp }: TransactionFilter) =>
  !!startTimestamp &&
  !!endTimestamp &&
  differenceInDays(endTimestamp, startTimestamp) > MAX_DAYS_TO_FILTER

/**
 * Translates the explorer's UI filters into an Envio query. Pure and synchronous: cheap enough to
 * run on every render, which is what lets the hook derive the query instead of syncing it in state.
 *
 * `undefined` when the filters produce no clause at all, or when they ask for too wide a range:
 * there is nothing to search for, so the caller leaves the query idle rather than asking the
 * indexer for an unfiltered page.
 *
 * `resolvedAddress` is the address a `.gno` name resolved to, when the hash field holds one.
 */
export const buildTransactionsQuery = (
  filters: TransactionFilter,
  resolvedAddress?: string | null,
): EnvioQueryArgs | undefined => {
  const bridge = filters.bridge.toUpperCase() as BridgesValues

  if (isRangeTooWide(filters)) return undefined

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

  if (filters.bridge) {
    where.push({ bridgeType: { _eq: bridge.includes('XDAI') ? 'XDAI' : 'AMB' } })
  }

  if (filters.bridgeDirection === BridgeDirection.gnosis2mainnet) {
    where.push({ initiatorNetwork: { _eq: 100 } })
  } else if (filters.bridgeDirection === BridgeDirection.mainnet2gnosis) {
    where.push({ initiatorNetwork: { _eq: 1 } })
  }

  const signers = validatorAddresses(filters.signedBy, bridge)
  if (signers.length) {
    where.push({ validations: { validatorAddress: { _in: signers } } })
  }

  const executors = validatorAddresses(filters.executedBy, bridge)
  if (executors.length) {
    where.push({ execution: { executorAddress: { _in: executors } } })
  }

  if (filters.startTimestamp) {
    where.push({ timestamp: { _gte: msToSeconds(filters.startTimestamp.getTime()) } })
  }

  if (filters.endTimestamp) {
    where.push({ timestamp: { _lte: msToSeconds(filters.endTimestamp.getTime()) } })
  }

  return where.length
    ? { where: { _and: where }, order_by: [{ timestamp: 'desc' }], limit: PAGE_SIZE, offset: 0 }
    : undefined
}
