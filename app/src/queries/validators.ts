import gql from 'graphql-tag'
import { RequestDocument } from 'graphql-request'

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

export const ENVIO_VALIDATORS_QUERY = `
  query EnvioValidators {
    Validator(where: { removed: { _eq: false }, hashAdded: { _is_null: false } }) {
      id
      name
      bridgeType
      address
      lastActivity
      signed(order_by: { timestamp: desc }, limit: 10) { id }
      executed(order_by: { timestamp: desc }, limit: 10) { id }
    }
  }
` as RequestDocument

export const ENVIO_VALIDATORS_ACTIVITY_QUERY = `
  query EnvioValidatorsActivity($after: numeric!) {
    Validator(where: { removed: { _eq: false }, hashAdded: { _is_null: false } }) {
      address
      name
      bridgeType
      signed(where: { timestamp: { _gt: $after } }) { id }
      executed(where: { timestamp: { _gt: $after } }) { id }
    }
  }
` as RequestDocument
