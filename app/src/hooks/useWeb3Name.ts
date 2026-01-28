import useSWR from 'swr'
import { createPublicClient, http } from 'viem'
import { gnosis } from 'viem/chains'
import { normalize } from 'viem/ens'

const client = createPublicClient({
  chain: gnosis,
  transport: http(process.env.NEXT_PUBLIC_RPC_GNOSIS),
})

interface UseWeb3NameProps {
  address?: string
  name?: string
}

const fetchName = async (address: string) => {
  const resolvedName = await client.getEnsName({
    address: address as `0x${string}`,
  })
  return resolvedName
}

const fetchAddress = async (name: string) => {
  const resolvedAddress = await client.getEnsAddress({
    name: normalize(name),
  })
  return resolvedAddress
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
