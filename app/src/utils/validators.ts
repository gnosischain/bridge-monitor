import { JsonRpcProvider } from '@ethersproject/providers'
import { cloneDeep } from 'lodash'

import { fromBNtoNumber } from '@/src/utils/bigNumber'
import { formatNumber } from '@/src/utils/format'
import { Transaction } from '@/src/utils/transactions'
import ambValidators from '@/src/utils/validators/amb.json'
import xdaiValidators from '@/src/utils/validators/xdai.json'
import { ValidatorStatusType } from '@/src/components/assets/ValidatorStatus'
import { Bridges, BridgesValues } from '@/src/constants/config/bridges'
import { getHomeGraphqlClient } from '@/src/constants/config/subgraph'
import { getEnvioGraphqlClient, isEnvioBackend } from '@/src/constants/config/indexer'
import { BalanceType, ValidatorStatusTypes } from '@/src/constants/types'
import { TRANSACTION_QUERY } from '@/src/queries/transactions'
import { ENVIO_VALIDATORS_ACTIVITY_QUERY, ENVIO_VALIDATORS_QUERY } from '@/src/queries/validators'
import {
  OrderDirection,
  QueryTransactionsArgs,
  TransactionStatus,
  Transaction_OrderBy,
  TransactionsQuery,
} from '@/types/generated/subgraph'

const XDAI_VALIDATORS = xdaiValidators as Validator[]
const AMB_VALIDATORS = ambValidators as Validator[]

export type Validator = {
  removed?: boolean | null
  address: string
  name: string
  bridgeType: string
  shortName: string
  status: ValidatorStatusType
  scanUrl?: string
  lastSeen?: number
  signed?: number
  executed?: number
  balanceHome?: BalanceType
}

export const VALIDATORS_BY_BRIDGE = {
  [Bridges.xdai]: XDAI_VALIDATORS,
  [Bridges.amb]: AMB_VALIDATORS,
  [Bridges.omni]: AMB_VALIDATORS,
} as Record<BridgesValues, Validator[]>

const _validatorsByAddress = (validators: Validator[]) => {
  return validators.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.address.toLowerCase()]: curr,
    }),
    {},
  ) as Record<string, Validator>
}

const _validatorsByName = (validators: Validator[]) => {
  return validators.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.name.toLowerCase()]: curr,
    }),
    {},
  ) as Record<string, Validator>
}

export const VALIDATORS_BY_ADDRESS = {
  [Bridges.xdai]: _validatorsByAddress(VALIDATORS_BY_BRIDGE[Bridges.xdai]),
  [Bridges.amb]: _validatorsByAddress(VALIDATORS_BY_BRIDGE[Bridges.amb]),
  [Bridges.omni]: _validatorsByAddress(VALIDATORS_BY_BRIDGE[Bridges.amb]),
}

export const VALIDATORS_BY_NAME = {
  [Bridges.xdai]: _validatorsByName(VALIDATORS_BY_BRIDGE[Bridges.xdai]),
  [Bridges.amb]: _validatorsByName(VALIDATORS_BY_BRIDGE[Bridges.amb]),
  [Bridges.omni]: _validatorsByName(VALIDATORS_BY_BRIDGE[Bridges.amb]),
}

export const VALIDATOR_STATUS: Record<TransactionStatus, ValidatorStatusTypes> = {
  [TransactionStatus.Initiated]: ValidatorStatusTypes.pending,
  [TransactionStatus.Collecting]: ValidatorStatusTypes.submitted,
  [TransactionStatus.Unclaimed]: ValidatorStatusTypes.submittedExecuted,
  [TransactionStatus.Completed]: ValidatorStatusTypes.submittedExecuted,
  [TransactionStatus.Error]: ValidatorStatusTypes.default,
}

export const getValidationsStatus = (transaction: Transaction, _validators: Validator[]) => {
  const listByAddress = _validatorsByAddress(_validators)
  const validators = cloneDeep(listByAddress) // @todo analyze if is required to create full clone
  const txStatus = transaction.transactionStatus

  transaction.validations?.forEach(({ scanUrl, validatorAddr }) => {
    if (validators[validatorAddr]) {
      validators[validatorAddr].status = VALIDATOR_STATUS[txStatus]
      validators[validatorAddr].scanUrl = scanUrl
    }
  })

  if (transaction.execution?.validatorAddr && validators[transaction.execution.validatorAddr]) {
    validators[transaction.execution.validatorAddr].status = ValidatorStatusTypes.executed
    validators[transaction.execution.validatorAddr].scanUrl = transaction.execution.scanUrl
  }
  return Object.values(validators)
}

export const fetchHomeValidators = async () => {
  type EnvioValidatorRow = {
    id?: string
    name?: string | null
    removed?: boolean | null
    bridgeType?: string | null
    address: string
    lastActivity?: number | null
    signed?: Array<{ id: string }>
    executed?: Array<{ id: string }>
  }
  const request = getEnvioGraphqlClient<{ Validator: EnvioValidatorRow[] }>()
  const res = await request(ENVIO_VALIDATORS_QUERY, {})
  return res.Validator
}

// export const fetchHomeValidators = async (filter?: ValidatorsQueryVariables) => {
//   if (isEnvioBackend()) {
//     type EnvioValidatorRow = {
//       id?: string
//       name?: string | null
//       removed?: boolean | null
//       bridgeType?: string | null
//       address: string
//       lastActivity?: number | null
//       signed?: Array<{ id: string }>
//       executed?: Array<{ id: string }>
//     }
//     const request = getEnvioGraphqlClient<{ Validator: EnvioValidatorRow[] }>()
//     const res = await request(ENVIO_VALIDATORS_QUERY, {})
//     return res.Validator
//   }
//   const { validators } = await getHomeGraphqlClient()<ValidatorsQuery, ValidatorsQueryVariables>(
//     VALIDATORS_QUERY,
//     filter,
//   )
//   return validators
// }

export const getValidatorByAddress = (validatorAddress: string, bridge: BridgesValues) => {
  const bridgeValidators = VALIDATORS_BY_ADDRESS[bridge]
  if (!bridgeValidators) return undefined
  const lowerCaseAddress = validatorAddress.toLowerCase()
  if (!bridgeValidators[lowerCaseAddress]) return undefined
  return bridgeValidators[lowerCaseAddress]
}

export const getValidatorByName = (validatorName: string, bridge: BridgesValues) => {
  const bridgeValidators = VALIDATORS_BY_NAME[bridge]
  if (!bridgeValidators) return undefined
  const lowerCaseAddress = validatorName.toLowerCase()
  if (!bridgeValidators[lowerCaseAddress]) return undefined
  return bridgeValidators[lowerCaseAddress]
}

export const getBalance = async (address: string, provider: JsonRpcProvider) => {
  const balance = await provider.getBalance(address)
  return formatNumber(fromBNtoNumber(balance) ?? 0)
}

const MAX_RESULTS = 1000
const RESULTS_ORDER = OrderDirection.Desc
const ORDER_BY = Transaction_OrderBy.Timestamp

export const fetchSignedTransactions = async (bridge: BridgesValues, afterDate: number) => {
  const bridgeValue = bridge.toUpperCase() as BridgesValues
  const validators = VALIDATORS_BY_BRIDGE[bridgeValue]

  if (isEnvioBackend()) {
    type EnvioValidatorRow = {
      address: string
      name?: string | null
      bridgeType?: string | null
      signed?: Array<{ id: string }>
      executed?: Array<{ id: string }>
    }
    const request = getEnvioGraphqlClient<{ Validator: EnvioValidatorRow[] }>()
    const res = await request(ENVIO_VALIDATORS_ACTIVITY_QUERY, { after: String(afterDate) })
    const rows = (res.Validator || []).filter(
      (v: EnvioValidatorRow) => String(v.bridgeType || '').toUpperCase() === bridgeValue,
    )
    return rows.map((v: EnvioValidatorRow) => ({
      name: v.name || v.address,
      value: Array.isArray(v.signed) ? v.signed.length : 0,
    }))
  }

  // Subgraph path (legacy)
  const signedTXsPromises = validators.map(async (validator) => {
    const query = {
      first: MAX_RESULTS,
      orderBy: ORDER_BY,
      orderDirection: RESULTS_ORDER,
      skip: 0,
      where: {
        bridgeName: bridgeValue,
        validations_: {
          timestamp_gt: afterDate,
          validatorAddr: validator.address.toLowerCase(),
        },
      },
    }

    const { transactions: signedTxs } = await getHomeGraphqlClient()<
      TransactionsQuery,
      QueryTransactionsArgs
    >(TRANSACTION_QUERY, query)

    const signedTxsCount = signedTxs.length
    return { name: validator.name, value: signedTxsCount }
  })

  const eachValidatorSignedTXs = await Promise.all(signedTXsPromises)
  return eachValidatorSignedTXs
}

export const fetchExecutedTransactions = async (bridge: BridgesValues, afterDate: number) => {
  const bridgeValue = bridge.toUpperCase() as BridgesValues
  const validators = VALIDATORS_BY_BRIDGE[bridgeValue]

  if (isEnvioBackend()) {
    type EnvioValidatorRow = {
      address: string
      name?: string | null
      bridgeType?: string | null
      signed?: Array<{ id: string }>
      executed?: Array<{ id: string }>
    }
    const request = getEnvioGraphqlClient<{ Validator: EnvioValidatorRow[] }>()
    const res = await request(ENVIO_VALIDATORS_ACTIVITY_QUERY, { after: String(afterDate) })
    const rows = (res.Validator || []).filter(
      (v: EnvioValidatorRow) => String(v.bridgeType || '').toUpperCase() === bridgeValue,
    )
    return rows.map((v: EnvioValidatorRow) => ({
      name: v.name || v.address,
      value: Array.isArray(v.executed) ? v.executed.length : 0,
    }))
  }

  // Subgraph path (legacy)
  const executedTXsPromises = validators.map(async (validator) => {
    const query = {
      first: MAX_RESULTS,
      orderBy: ORDER_BY,
      orderDirection: RESULTS_ORDER,
      where: {
        bridgeName: bridgeValue,
        execution_: {
          timestamp_gt: afterDate,
          validatorAddr: validator.address.toLowerCase(),
        },
      },
    }

    const { transactions } = await getHomeGraphqlClient()<TransactionsQuery, QueryTransactionsArgs>(
      TRANSACTION_QUERY,
      query,
    )
    return { name: validator.name, value: transactions.length }
  })

  return await Promise.all(executedTXsPromises)
}
