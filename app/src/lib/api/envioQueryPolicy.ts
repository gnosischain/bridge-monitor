import type { RequestDocument } from 'graphql-request'

import { TRANSACTIONS_PAGE_SIZE } from '@/src/constants/misc'
import { ENVIO_TRANSACTIONS_QUERY } from '@/src/queries/transactions'
import { ENVIO_VALIDATORS_ACTIVITY_QUERY, ENVIO_VALIDATORS_QUERY } from '@/src/queries/validators'

/**
 * What `/api/graphql` accepts, per document.
 *
 * An allow-list of documents constrains which questions reach the indexer, never what is asked
 * with them.
 */

export type EnvioPolicy = {
  /** How long an answer to this document may be reused, in milliseconds. */
  ttl: number
  /** Whether these variables are ones the app could have asked for. */
  accepts: (variables: unknown) => boolean
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const takesNoVariables = (variables: unknown) =>
  variables == null || (isPlainObject(variables) && Object.keys(variables).length === 0)

const QUARTER_HOUR = 900
const MIN_LOOKBACK = 60 * 60
const MAX_LOOKBACK = 31 * 24 * 60 * 60

const acceptsLookback = (variables: unknown) => {
  if (!isPlainObject(variables)) return false

  const keys = Object.keys(variables)
  if (keys.length !== 1 || keys[0] !== 'after') return false

  // Sent as a string: the schema types the bound as `numeric!`, which Hasura reads from a string.
  const { after } = variables
  if (typeof after !== 'string' || !/^\d{1,12}$/.test(after)) return false

  const seconds = Number(after)
  if (seconds % QUARTER_HOUR !== 0) return false

  const age = Math.floor(Date.now() / 1000) - seconds
  return age >= MIN_LOOKBACK && age <= MAX_LOOKBACK
}

/** Every field and operator the explorer's filters can put in a `where` clause. */
const WHERE_KEYS = new Set([
  '_and',
  '_or',
  '_eq',
  '_gte',
  '_lte',
  'id',
  'transactionHash',
  'initiator',
  'receiver',
  'bridgeType',
  'initiatorNetwork',
  'timestamp',
])

const MAX_WHERE_DEPTH = 8
const MAX_WHERE_NODES = 64

/**
 * Ids, hashes and addresses run to 66 characters at most; the one free-form string is a `.gno` name,
 * sent as typed when it does not resolve. Anything past this only bloats a cache key, or an error
 * message echoing it.
 */
const MAX_WHERE_STRING = 256

/**
 * Walks the clause the UI built. Unknown fields are refused rather than passed through.
 */
const acceptsWhere = (where: unknown) => {
  let nodes = 0

  const walk = (value: unknown, depth: number): boolean => {
    if ((nodes += 1) > MAX_WHERE_NODES || depth > MAX_WHERE_DEPTH) return false

    if (Array.isArray(value)) return value.every((entry) => walk(entry, depth + 1))

    if (isPlainObject(value)) {
      return Object.entries(value).every(
        ([key, entry]) => WHERE_KEYS.has(key) && walk(entry, depth + 1),
      )
    }

    return (
      (typeof value === 'string' && value.length <= MAX_WHERE_STRING) ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    )
  }

  return walk(where, 0)
}

/**
 * The explorer's lists ask for the newest first; the lookups by id or hash send no ordering.
 * Checked field by field, not by comparing `JSON.stringify` output: that throws on an array nested
 * a few thousand deep, which would escape `resolve` as a 500 instead of a refusal.
 */
const acceptsOrdering = (ordering: unknown) => {
  if (ordering === undefined) return true
  if (!Array.isArray(ordering) || ordering.length !== 1) return false

  const [only] = ordering
  return isPlainObject(only) && Object.keys(only).length === 1 && only.timestamp === 'desc'
}

const TRANSACTION_VARIABLES = ['where', 'order_by', 'limit', 'offset']

/**
 * The explorer fetches a single page and has no pagination, so every request it makes carries
 * `TRANSACTIONS_PAGE_SIZE` from offset 0 (`fetchTransactions` fills both in when a caller leaves
 * them out). Anything else is a request the app never makes: a deep offset, or no `limit` at all,
 * which asks the indexer for every matching row.
 */
const acceptsTransactionQuery = (variables: unknown) => {
  if (!isPlainObject(variables)) return false
  if (Object.keys(variables).some((key) => !TRANSACTION_VARIABLES.includes(key))) return false

  const { limit, offset, order_by: ordering, where } = variables

  if (!isPlainObject(where) || !acceptsWhere(where)) return false

  if (!acceptsOrdering(ordering)) return false
  if (limit !== TRANSACTIONS_PAGE_SIZE || offset !== 0) return false

  return true
}

export const ENVIO_QUERY_POLICY: Array<[RequestDocument, EnvioPolicy]> = [
  [ENVIO_TRANSACTIONS_QUERY, { ttl: 10_000, accepts: acceptsTransactionQuery }],
  [ENVIO_VALIDATORS_QUERY, { ttl: 30_000, accepts: takesNoVariables }],
  [ENVIO_VALIDATORS_ACTIVITY_QUERY, { ttl: 30_000, accepts: acceptsLookback }],
]
