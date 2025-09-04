import  gql  from 'graphql-tag'

export const VALIDATORS_QUERY = gql`
  query Validators {
    validators {
      id
      address
      name
      bridgeType
      lastActivity
    }
  }
`
