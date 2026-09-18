import { RequestDocument } from 'graphql-request'

export const ENVIO_VALIDATORS_QUERY = `
  query EnvioValidators {
    Validator {
      id
      name
      removed
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
    Validator(where: { removed: { _eq: false } }) {
      address
      name
      bridgeType
      signed(where: { timestamp: { _gt: $after } }) { id }
      executed(where: { timestamp: { _gt: $after } }) { id }
    }
  }
` as RequestDocument
