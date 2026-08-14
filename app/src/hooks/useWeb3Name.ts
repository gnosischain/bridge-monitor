import useSWR from 'swr'
import { createPublicClient, http, namehash, parseAbi } from 'viem'
import { gnosis } from 'viem/chains'
import { normalize } from 'viem/ens'

import { getProviderUrl } from '@/src/constants/config/rpc-providers'
import { Chains } from '@/src/constants/config/types'

// Reads run in the browser via SWR, so the same-origin `/api/rpc` proxy path resolves fine.
const client = createPublicClient({
  chain: gnosis,
  transport: http(getProviderUrl(Chains.gnosis), { retryCount: 0 }),
})

const SPACE_ID_REAL_CONTRACT = '0x6D3B3F99177FB2A5de7F9E928a9BD807bF7b5BAD'

const resolverAbi = parseAbi([
  'function name(bytes32 node) view returns (string)',
  'function addr(bytes32 node) view returns (address)',
])

interface UseWeb3NameProps {
  address?: string
  name?: string
}

const fetchName = async (address: string) => {
  try {
    const cleanAddress = address.toLowerCase().substring(2)
    const reverseNode = namehash(`${cleanAddress}.addr.reverse`)

    const name = await client.readContract({
      address: SPACE_ID_REAL_CONTRACT,
      abi: resolverAbi,
      functionName: 'name',
      args: [reverseNode],
    })

    return name || null
  } catch (err) {
    console.error('Error fetching name directly:', err)
    return null
  }
}

const fetchAddress = async (name: string) => {
  try {
    const node = namehash(normalize(name))

    const resolvedAddress = await client.readContract({
      address: SPACE_ID_REAL_CONTRACT,
      abi: resolverAbi,
      functionName: 'addr',
      args: [node],
    })

    return resolvedAddress
  } catch (err) {
    console.error('Error fetching address directly:', err)
    return null
  }
}

const useWeb3Name = ({ address, name }: UseWeb3NameProps) => {
  const { data: resolvedName, error: nameError } = useSWR(
    address ? [`name`, address] : null,
    () => (address ? fetchName(address) : null),
    {
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      focusThrottleInterval: 5000,
      loadingTimeout: 10000,
      onError: (err) => {
        console.error('Error resolving name:', name, err)
      },
    },
  )

  const { data: resolvedAddress, error: addressError } = useSWR(
    name ? [`address`, name] : null,
    () => (name ? fetchAddress(name) : null),
    {
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      focusThrottleInterval: 5000,
      loadingTimeout: 10000,
      onError: (err) => {
        console.error('Error resolving address:', address, err)
      },
    },
  )

  return { resolvedAddress, resolvedName, addressError, nameError }
}

export default useWeb3Name
