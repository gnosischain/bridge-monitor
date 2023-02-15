import { JsonRpcProvider } from '@ethersproject/providers'
import { cloneDeep } from 'lodash'

import { ValidatorStatusType } from '../components/assets/ValidatorStatus'
import { Bridges, BridgesValues } from '../constants/config/bridges'
import { chainsConfig } from '../constants/config/chains'
import { gnosis, mainnet } from '../constants/config/rpc-providers'
import { getHomeGraphqlClient } from '../constants/config/subgraph'
import { Chains } from '../constants/config/types'
import { BalanceType, ValidatorStatusTypes } from '../constants/types'
import { VALIDATORS_QUERY } from '../queries/validators'
import { fromBNtoNumber } from './bigNumber'
import { fromSubgraphTimestamp } from './date'
import { formatNumber } from './formatNumber'
import { Transaction } from './transactions'
import ambValidators from './validators/amb.json'
import xdaiValidators from './validators/xdai.json'
import {
  TransactionStatus,
  ValidatorsQuery,
  ValidatorsQueryVariables,
} from '@/types/generated/subgraph'

const XDAI_VALIDATORS = xdaiValidators as Validator[]
const AMB_VALIDATORS = ambValidators as Validator[]

export type Validator = {
  address: string
  name: string
  bridgeType: string
  shortName: string
  status: ValidatorStatusType
  scanUrl?: string
  lastSeen?: number
  signed?: number
  executed?: number
  balanceForeign?: BalanceType
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
  [TransactionStatus.Requested]: ValidatorStatusTypes.pending,
  [TransactionStatus.Collecting]: ValidatorStatusTypes.submitted,
  [TransactionStatus.Unclaimed]: ValidatorStatusTypes.submittedExecuted,
  [TransactionStatus.Claimed]: ValidatorStatusTypes.submittedExecuted,
  [TransactionStatus.Completed]: ValidatorStatusTypes.submittedExecuted,
  [TransactionStatus.Error]: ValidatorStatusTypes.default,
}

export const getValidationsStatus = (transaction: Transaction, _validators: Validator[]) => {
  const listByAddress = _validatorsByAddress(_validators)
  const validators = cloneDeep(listByAddress) // @todo analyze if is required to create full clone
  const txStatus = transaction.transactionStatus

  transaction.validations?.forEach(({ scanUrl, validatorAddress }) => {
    if (validators[validatorAddress]) {
      validators[validatorAddress].status = VALIDATOR_STATUS[txStatus]
      validators[validatorAddress].scanUrl = scanUrl
    }
  })
  if (transaction.execution && validators[transaction.execution.executorAddress]) {
    validators[transaction.execution.executorAddress].status = ValidatorStatusTypes.executed
    validators[transaction.execution.executorAddress].scanUrl = transaction.execution.scanUrl
  }
  return Object.values(validators)
}

const fetchHomeValidators = async (filter?: ValidatorsQueryVariables) => {
  const { validators } = await getHomeGraphqlClient()<ValidatorsQuery, ValidatorsQueryVariables>(
    VALIDATORS_QUERY,
    filter,
  )
  return validators
}

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

const getBalance = async (address: string, provider: JsonRpcProvider) => {
  const balance = await provider.getBalance(address)
  return formatNumber(fromBNtoNumber(balance) ?? 0)
}

export const fetchValidators = async (bridge: string) => {
  const homeProvider = gnosis()
  const foreignProvider = mainnet()

  const validatorsData = await Promise.all([fetchHomeValidators()])
  const validatorsFromSG = validatorsData[0]
  // const validatorsNative = validatorsData[1]
  // @todo verify that both coincide
  // if (validatorsNative.length !== validatorsForeign.length) throw new Error('Validators mismatch')
  const bridgeValue = bridge.toUpperCase() as BridgesValues
  const validatorsPromises = validatorsFromSG.map(async (v) => {
    const val = getValidatorByAddress(v.address, bridgeValue)
    if (val) {
      const balanceHomeValue = await getBalance(v.address, homeProvider)
      const balanceForeignValue = await getBalance(v.address, foreignProvider)
      return {
        ...val,
        lastSeen: fromSubgraphTimestamp(v.lastActivity),
        signed: v.signed.length,
        executed: v.executed.length,
        balanceHome: {
          token: chainsConfig[Chains.xdai].token,
          chain: chainsConfig[Chains.xdai].name,
          value: balanceHomeValue,
        },
        balanceForeign: {
          token: chainsConfig[Chains.mainnet].token,
          chain: chainsConfig[Chains.mainnet].name,
          value: balanceForeignValue,
        },
      }
    }
  })
  const validators = await Promise.all(validatorsPromises)
  return validators
    .filter(Boolean)
    .filter((v) => v && v.bridgeType.toUpperCase() === bridgeValue) as Validator[]
}
