/**
 * Adapters for Ethers.js v5 compatibility with wagmi/viem.
 * Reference: https://wagmi.sh/react/guides/ethers
 */
import { providers } from 'ethers'
import type { Account, Chain, Client, Transport } from 'viem'

/** Convert a viem Connector Client to an ethers.js v5 Signer */
export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  return provider.getSigner(account.address)
}

/** Convert a viem Client to an ethers.js v5 Provider */
export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback') {
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    )
  }
  return new providers.JsonRpcProvider(transport.url, network)
}

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
