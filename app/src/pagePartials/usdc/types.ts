import { Token } from '@/types/token'
import { BigNumberish, ContractTransaction } from 'ethers'

export type TokenUsdc = Omit<Token, 'extensions'>

export type UsdcTransFormState = {
  amount: string
  account: string
  token?: TokenUsdc
  tokenOut?: TokenUsdc
}

export type TransactionData = {
  gasLimit: BigNumberish
  tx: () => Promise<ContractTransaction>
}
