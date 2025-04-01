import useSWR from 'swr'
import { createWeb3Name } from '@web3-name-sdk/core'

const web3name = createWeb3Name({ rpcUrl: process.env.NEXT_PUBLIC_RPC_MAINNET })

interface UseWeb3NameProps {
  address?: string
  name?: string
}

const fetchName = async (address: string) => {
  const resolvedName = await web3name.getDomainName({
    address,
    queryTldList: ['gno'],
  })
  return resolvedName
}

const fetchAddress = async (name: string) => {
  const resolvedAddress = await web3name.getAddress(name)
  return resolvedAddress
}

const useWeb3Name = ({ address, name }: UseWeb3NameProps) => {
  const { data: resolvedName, error: nameError } = useSWR(
    address ? [`name`, address] : null,
    () => (address ? fetchName(address) : null),
    {
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
    },
  )

  const { data: resolvedAddress, error: addressError } = useSWR(
    name ? [`address`, name] : null,
    () => (name ? fetchAddress(name) : null),
    {
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
    },
  )

  if (addressError) console.error('Error resolving address:', address, addressError)
  if (nameError) console.error('Error resolving name:', name, nameError)

  return { resolvedAddress, resolvedName, addressError, nameError }
}

export default useWeb3Name
