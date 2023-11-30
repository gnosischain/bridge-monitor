import React, { createContext, useContext } from 'react'
import useSWR from 'swr'
import { BridgesValues } from '@/src/constants/config/bridges'
import { fetchHomeValidators, getBalance, getValidatorByAddress } from '@/src/utils/validators'
import { Validator } from '@/src/utils/validators'
import { gnosis } from '@/src/constants/config/rpc-providers'
import { fromSubgraphTimestamp } from '@/src/utils/date'
import { Chains, chainsConfig } from '@/src/constants/config/chains'
import cloneDeep from 'lodash/cloneDeep'

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
    .filter((v) => getValidatorByAddress(v.address, v.bridgeType!))
    .map(async (v) => {
      const val = getValidatorByAddress(v.address, v.bridgeType!)
      if (!val) throw new Error('Validator not found')

      const balanceHomeValue = await getBalance(v.address, homeProvider)

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

  return (
    <ValidatorsContext.Provider
      value={{ validators: res.data || defaultValidators, refetch: res.mutate }}
    >
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
