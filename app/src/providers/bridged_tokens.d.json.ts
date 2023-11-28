import { Nullable } from '@/src/utils/format'

export type BlockscoutToken = {
  bridge_type: string
  foreign_address: string
  origin_chain_id: string
  address: string
  circulating_market_cap: Nullable<string>
  decimals: string
  exchange_rate: Nullable<string>
  holders: string
  icon_url: Nullable<string>
  is_bridged: boolean
  name: string
  symbol: string
  total_supply: string
  type: string
}

declare const bridged_tokens: {
  items: Array<BlockscoutToken>
}

export default bridged_tokens
