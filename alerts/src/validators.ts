import { useGraphqlClient } from "./graphql"
import { gnosis, mainnet } from "./providers"
import { VALIDATORS_QUERY } from "./queries/validators"
import { getNativeBalance, TokenBalance, TokenBalanceType } from "./tokens"

const mainnetProvider = mainnet()
const gnosisProvider = gnosis()

export type BridgeType = 'XDAI' | 'AMB'

export type Validator = {
  id: string
  address?: string
  bridgeType?: BridgeType
  lastActivity?: string
  name?: string
}

type ValidatorsResponse = {
  Validator: Validator[]
}

const fetchValidators = async () => {
  const graphqlClient = useGraphqlClient()
  const result = await graphqlClient<ValidatorsResponse>(VALIDATORS_QUERY)
  const validators = result?.Validator || []

  // Filter out validators with the specific address
  const excludedAddress = '0x456c255a8bc1f33778603a2a48eb6b0c69f4d48e' // telepathy
  const filteredValidators = validators.filter(
    (validator: Validator) => validator.address?.toLowerCase() !== excludedAddress.toLowerCase()
  )

  if (process.env.IS_VALIDATOR_BALANCE_ON_GC == 'true') {
    const validatorsPromises = filteredValidators.map(async (validator: Validator) => {
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
    return await Promise.all(validatorsPromises)
  } else {
    const validatorsPromises = filteredValidators.map(async (validator: Validator) => {
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
    return await Promise.all(validatorsPromises)
  }
}

export { fetchValidators }
