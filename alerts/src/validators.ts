import { useForeignGraphqlClient, useNativeGraphqlClient } from "./graphql"
import { gnosis, mainnet } from "./providers"
import { VALIDATORS_QUERY } from "./queries/validators"
import { getNativeBalance, TokenBalance, TokenBalanceType } from "./tokens"
import { BridgeType, ValidatorsQuery, ValidatorsQueryVariables } from "./types/subgraph/subgraph"

const mainnetProvider = mainnet()
const gnosisProvider = gnosis()

export type Validator = {
  __typename?: 'Validator'
  id: string
  address?: string
  bridgeType?: BridgeType
  lastSeen?: string
  name?: string
  tokensBalances: TokenBalance[]
}

const fetchNativeValidators = async (filter?: ValidatorsQueryVariables) => {
  const { validators } = await useNativeGraphqlClient()<
    ValidatorsQuery,
    ValidatorsQueryVariables
  >(VALIDATORS_QUERY, filter)
  return validators
}

const fetchForeignValidators = async (filter?: ValidatorsQueryVariables) => {
  const { validators } = await useForeignGraphqlClient()<
    ValidatorsQuery,
    ValidatorsQueryVariables
  >(VALIDATORS_QUERY, filter)
  return validators
}

const fetchValidators = async () => {
  const validatorsData = await Promise.all([fetchNativeValidators(), fetchForeignValidators()])
  const validatorsNative = validatorsData[0]
  // @todo verify that both coincide
  const validatorsForeign = validatorsData[1]
  if (validatorsNative.length !== validatorsForeign.length) throw new Error('Validators mismatch')
  const validatorsPromises = validatorsNative.map<Promise<Validator>>(async (validator) => {
    const [xdaiBalance, ethBalance] = await Promise.all([
      getNativeBalance(gnosisProvider, validator.address),
      getNativeBalance(mainnetProvider, validator.address),
    ])
    const xdaiToken: TokenBalance = {
      type: TokenBalanceType.Native,
      name: "XDAI",
      balance: xdaiBalance
    }
    const ethToken: TokenBalance = {
      type: TokenBalanceType.Native,
      name: "ETH",
      balance: ethBalance
    }
    return {
      ...validator,
      tokensBalances: [xdaiToken, ethToken],
    }
  })
  const validators = await Promise.all(validatorsPromises)
  return validators
}

export { fetchValidators }
