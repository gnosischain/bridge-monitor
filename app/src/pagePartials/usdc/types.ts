import { Token } from '@/types/token'

export type TokenUsdc = Omit<Token, 'extensions'>

export type UsdcTransFormState = {
  amount: string
  account: string
  token?: TokenUsdc
  tokenOut?: TokenUsdc
}
