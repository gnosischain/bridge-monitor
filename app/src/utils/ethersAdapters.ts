/**
 * Adapters for Ethers.js v5 compatibility with wagmi/viem.
 * Reference: https://wagmi.sh/react/guides/ethers
 */
import { providers } from 'ethers'
import type { Account, Chain, Client, Transport } from 'viem'

/**
 * Extract the underlying Web3Provider from a viem Connector Client.
 * This lets existing ethers code get a provider and call getSigner() on it.
 */
export function clientToWeb3Provider(client: Client<Transport, Chain, Account>) {
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  return new providers.Web3Provider(transport, network)
}
