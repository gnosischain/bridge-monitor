import React, { createContext, useContext } from 'react'
import useSWR from 'swr'

import { BridgesValues } from '@/src/constants/config/bridges'
import { fetchHomeValidators, getBalance, getValidatorByAddress } from '@/src/utils/validators'
import { Validator } from '@/src/utils/validators'
import { fromSecondsTimestamp } from '@/src/utils/date'
import { Chains, chainsConfig } from '@/src/constants/config/chains'
import cloneDeep from 'lodash/cloneDeep'
import { ValidatorStatusTypes } from '@/src/constants/types'
import {
  TELEPATHY_VALIDATOR_ADDRESS,
  TELEPATHY_VALIDATOR_ADDRESS_REPLACED,
} from '@/src/constants/misc'

type ValidatorsContextType = {
  validators: Record<BridgesValues, Validator[]>
  refetch: () => void
}

const defaultValidators: Record<BridgesValues, Validator[]> = {
  XDAI: [],
  AMB: [],
  OMNIBRIDGE: [],
}

const ValidatorsContext = createContext<ValidatorsContextType>({
  validators: {
    XDAI: [],
    AMB: [],
    OMNIBRIDGE: [],
  },
  refetch: () => undefined,
})

const fetcher = async () => {
  const validatorsData = await fetchHomeValidators()

  const validatorsPromises = validatorsData.map(async (v) => {
    const staticVal = v.bridgeType
      ? getValidatorByAddress(v.address, v.bridgeType as BridgesValues)
      : undefined

    // Telepathy replacement only for balance call
    const balanceAddr =
      v.address.toLowerCase() === TELEPATHY_VALIDATOR_ADDRESS.toLowerCase()
        ? TELEPATHY_VALIDATOR_ADDRESS_REPLACED
        : v.address
    const balanceHomeValue = await getBalance(balanceAddr, Chains.gnosis)

    const name = v.name || staticVal?.name || v.address
    const shortName = staticVal?.shortName || name

    const validator: Validator = {
      address: v.address.toLowerCase(),
      name,
      removed: v.removed,
      bridgeType: String(v.bridgeType || staticVal?.bridgeType || ''),
      shortName,
      status: ValidatorStatusTypes.default,
      lastSeen: fromSecondsTimestamp(v.lastActivity ?? 0),
      signed: Array.isArray(v.signed) ? v.signed.length : 0,
      executed: Array.isArray(v.executed) ? v.executed.length : 0,
      balanceHome: {
        token: chainsConfig[Chains.gnosis].token,
        chain: chainsConfig[Chains.gnosis].name,
        value: balanceHomeValue,
      },
      scanUrl: undefined,
    }

    return validator
  })

  const validators = await Promise.all(validatorsPromises)

  const res = cloneDeep(defaultValidators)

  validators.forEach((v) => {
    const key = (v.bridgeType || '').toUpperCase() as BridgesValues
    if (res[key]) {
      res[key].push(v)
    }
  })

  return res
}

export const ValidatorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const res = useSWR('validators', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  const validators = res.data || defaultValidators

  return (
    <ValidatorsContext.Provider value={{ validators: validators, refetch: res.mutate }}>
      {children}
    </ValidatorsContext.Provider>
  )
}

export const useValidators = (bridge?: BridgesValues) => {
  const context = useContext(ValidatorsContext)
  if (context === undefined) {
    throw new Error('useValidators must be used within a ValidatorsProvider')
  }

  return {
    refetch: context.refetch,
    validators: bridge ? context.validators[bridge.toUpperCase() as BridgesValues] : [],
  }
}
