import { Token } from '@/types/token'
import { type Hash } from 'viem'

export type TokenUsdc = Omit<Token, 'extensions'>

export type UsdcTransFormState = {
  amount: string
  account: string
  token?: TokenUsdc
  tokenOut?: TokenUsdc
}

export type TransactionData = {
  gasLimit: bigint
  tx: () => Promise<Hash>
}
