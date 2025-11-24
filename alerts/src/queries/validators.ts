import  gql  from 'graphql-tag'

export const VALIDATORS_QUERY = gql`
  query EnvioValidators {
    Validator {
      id
      address
      name
      bridgeType
      lastActivity
    }
  }
`
