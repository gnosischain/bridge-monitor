import React, { createContext, useContext } from 'react'
import useSWR from 'swr'

import { Bridges, BridgesValues } from '@/src/constants/config/bridges'
import { fetchHomeValidators, getBalance, getValidatorByAddress } from '@/src/utils/validators'
import { Validator } from '@/src/utils/validators'
import { gnosis } from '@/src/constants/config/rpc-providers'
import { fromSubgraphTimestamp } from '@/src/utils/date'
import { Chains, chainsConfig } from '@/src/constants/config/chains'
import cloneDeep from 'lodash/cloneDeep'
import {
  TELEPATHY_VALIDATOR_ADDRESS,
  TELEPATHY_VALIDATOR_ADDRESS_REPLACED,
} from '@/src/constants/misc'
import { useHashi } from '@/src/hooks/useHashi'

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
  const homeProvider = gnosis()
  const validatorsData = await fetchHomeValidators()

  const validatorsPromises = validatorsData
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .filter((v) => getValidatorByAddress(v.address, v.bridgeType!))
    .map(async (v) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const val = getValidatorByAddress(v.address, v.bridgeType!)
      if (!val) throw new Error('Validator not found')

      const validatorAddress =
        v.address.toLowerCase() === TELEPATHY_VALIDATOR_ADDRESS.toLowerCase()
          ? TELEPATHY_VALIDATOR_ADDRESS_REPLACED
          : v.address
      const balanceHomeValue = await getBalance(validatorAddress, homeProvider)

      return {
        ...val,
        lastSeen: fromSubgraphTimestamp(v.lastActivity),
        signed: v.signed.length,
        executed: v.executed.length,
        balanceHome: {
          token: chainsConfig[Chains.gnosis].token,
          chain: chainsConfig[Chains.gnosis].name,
          value: balanceHomeValue,
        },
      }
    })

  const validators = await Promise.all(validatorsPromises)

  const res = cloneDeep(defaultValidators)

  validators.forEach((v) => {
    res[v.bridgeType.toUpperCase() as BridgesValues].push(v)
  })

  return res
}

export const ValidatorsProvider: React.FC = ({ children }) => {
  const res = useSWR('validators', fetcher)
  const { hashiAmb, hashiXdai } = useHashi()

  const validators = res.data || defaultValidators

  if (validators) {
    if (hashiAmb) {
      const existingIndexAmb = validators[Bridges.amb].findIndex(
        (validator: Validator) => 'id' in validator && validator.id === hashiAmb.id,
      )
      if (existingIndexAmb !== -1) {
        validators[Bridges.amb][existingIndexAmb] = hashiAmb
      } else {
        // Add new hashi object
        validators[Bridges.amb].push(hashiAmb)
      }
    }

    if (hashiXdai) {
      const existingIndexXdai = validators[Bridges.xdai].findIndex(
        (validator: Validator) => 'id' in validator && validator.id === hashiXdai.id,
      )
      if (existingIndexXdai !== -1) {
        validators[Bridges.xdai][existingIndexXdai] = hashiXdai
      } else {
        validators[Bridges.xdai].push(hashiXdai)
      }
    }
  }

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
