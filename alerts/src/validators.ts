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
  lastActivity?: string
  name?: string
}

const fetchNativeValidators = async (filter?: ValidatorsQueryVariables) => {
  const graphqlClient = useNativeGraphqlClient()
  const result: any = await graphqlClient(VALIDATORS_QUERY, filter)
  
  const validators = result?.Validator || []
  
  return validators
}

const fetchForeignValidators = async (filter?: ValidatorsQueryVariables) => {
  const graphqlClient = useForeignGraphqlClient()
  const result: any = await graphqlClient(VALIDATORS_QUERY, filter)
  
  const validators = result?.Validator || []
  return validators
}

const fetchValidators = async () => {
  const validatorsData = await Promise.all([
    fetchNativeValidators(),
    fetchForeignValidators(),
  ])

  const validatorsNative = validatorsData[0]
  // @todo verify that both coincide
  const validatorsForeign = validatorsData[1]
  
  // Filter out validators with the specific address
  const excludedAddress = '0x456c255a8bc1f33778603a2a48eb6b0c69f4d48e' // telepathy
  const filteredValidatorsNative = validatorsNative.filter(
    (validator: Validator) => validator.address?.toLowerCase() !== excludedAddress.toLowerCase()
  )
  const filteredValidatorsForeign = validatorsForeign.filter(
    (validator: Validator) => validator.address?.toLowerCase() !== excludedAddress.toLowerCase()
  )
 
  if(process.env.IS_VALIDATOR_BALANCE_ON_GC == 'true'){
      const validatorsPromises = filteredValidatorsNative.map(async (validator: Validator) => {
        const [xdaiBalance] = await Promise.all([
          getNativeBalance(gnosisProvider, validator.address),
        
        ])
        const xdaiToken: TokenBalance = {
          type: TokenBalanceType.Native,
          name: "XDAI",
          balance: xdaiBalance
        }
       
        return {
          ...validator,
          tokensBalances: [xdaiToken],
        }
      })
      const validators = await Promise.all(validatorsPromises)
      return validators
  }else{
    if (filteredValidatorsNative.length !== filteredValidatorsForeign.length) throw new Error('Validators mismatch')
      const validatorsPromises = filteredValidatorsNative.map(async (validator: Validator) => {
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
 
}

export { fetchValidators }