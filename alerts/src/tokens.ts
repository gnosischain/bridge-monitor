import { ethers } from "ethers"
import { RPCProvider } from "./providers"

export enum TokenBalanceType {
  Native = 'Native',
  ERC20 = 'ERC20',
}

export type TokenBalance = {
  type: TokenBalanceType,
  name: string
  balance?: number
  address?: string
  iconUrl?: string
}

// we can use this function to track the validator balance of xdai and eth per each network
export const getNativeBalance = async (provider: RPCProvider, address: string) => {
  const balance = await provider.getBalance(address)
  return parseFloat(ethers.utils.formatEther(balance))
}
