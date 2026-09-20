import type { RequestDocument } from 'graphql-request'

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

const isInteger = (value: unknown, min: number, max: number) =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max

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

    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  }

  return walk(where, 0)
}

const ORDERINGS = new Set([JSON.stringify([{ timestamp: 'desc' }]), JSON.stringify(null)])

const TRANSACTION_VARIABLES = ['where', 'order_by', 'limit', 'offset']

// `defaultRequestLimit` in `utils/transactions.ts`; the explorer's own page size is half of it.
const MAX_LIMIT = 1_000
const MAX_OFFSET = 10_000

const acceptsTransactionQuery = (variables: unknown) => {
  if (!isPlainObject(variables)) return false
  if (Object.keys(variables).some((key) => !TRANSACTION_VARIABLES.includes(key))) return false

  const { limit, offset, order_by: ordering, where } = variables

  if (!isPlainObject(where) || !acceptsWhere(where)) return false

  if (ordering !== undefined && !ORDERINGS.has(JSON.stringify(ordering ?? null))) return false
  if (limit !== undefined && !isInteger(limit, 1, MAX_LIMIT)) return false
  if (offset !== undefined && !isInteger(offset, 0, MAX_OFFSET)) return false

  return true
}

export const ENVIO_QUERY_POLICY: Array<[RequestDocument, EnvioPolicy]> = [
  [ENVIO_TRANSACTIONS_QUERY, { ttl: 10_000, accepts: acceptsTransactionQuery }],
  [ENVIO_VALIDATORS_QUERY, { ttl: 30_000, accepts: takesNoVariables }],
  [ENVIO_VALIDATORS_ACTIVITY_QUERY, { ttl: 30_000, accepts: acceptsLookback }],
]
