import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'

export type BridgeFormState = {
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: string
  recipient: string
  receiveNativeToken: boolean
  account: string
  token?: Token
}
