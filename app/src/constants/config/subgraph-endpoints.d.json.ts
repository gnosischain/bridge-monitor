export interface SubgraphEndpoints {
  [chainId: string]: {
    home: {
      production: string
      development: string
    }
    foreign: {
      production: string
      development: string
    }
  }
}

declare const sg_endpoints: SubgraphEndpoints

export default sg_endpoints
