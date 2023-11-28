import gql from 'graphql-tag'

// @todo filter for signed/executed property does not work as expected
export const VALIDATORS_QUERY = gql`
  query Validators {
    validators(where: { removed: false }) {
      id
      name
      bridgeType
      address
      lastActivity
      signed(orderBy: timestamp, orderDirection: desc, first: 10) {
        id
      }
      executed(orderBy: timestamp, orderDirection: desc, first: 10) {
        id
      }
    }
  }
`
