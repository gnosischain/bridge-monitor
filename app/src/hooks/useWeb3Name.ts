import { useMemo } from 'react'
import { isAddress, namehash, parseAbi, zeroAddress } from 'viem'
import { normalize } from 'viem/ens'
import { useReadContract } from 'wagmi'

import { Chains } from '@/src/constants/config/types'

const SPACE_ID_REAL_CONTRACT = '0x6D3B3F99177FB2A5de7F9E928a9BD807bF7b5BAD'

const resolverAbi = parseAbi([
  'function name(bytes32 node) view returns (string)',
  'function addr(bytes32 node) view returns (address)',
])

const resolverContract = {
  abi: resolverAbi,
  address: SPACE_ID_REAL_CONTRACT,
  chainId: Chains.gnosis,
} as const

const queryConfig = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: 2,
  retryDelay: 3000,
  staleTime: 5 * 60 * 1000,
} as const

interface UseWeb3NameProps {
  address?: string
  name?: string
}

const useWeb3Name = ({ address, name }: UseWeb3NameProps) => {
  const reverseNode = useMemo(
    () =>
      address && isAddress(address)
        ? namehash(`${address.toLowerCase().substring(2)}.addr.reverse`)
        : undefined,
    [address],
  )

  const forwardNode = useMemo(() => {
    if (!name) return undefined
    try {
      return namehash(normalize(name))
    } catch {
      return undefined
    }
  }, [name])

  const { data: resolvedName, error: nameError } = useReadContract({
    ...resolverContract,
    functionName: 'name',
    args: reverseNode ? [reverseNode] : undefined,
    query: { ...queryConfig, enabled: Boolean(reverseNode) },
  })

  const {
    data: resolvedAddress,
    error: addressError,
    isLoading: isResolvingAddress,
  } = useReadContract({
    ...resolverContract,
    functionName: 'addr',
    args: forwardNode ? [forwardNode] : undefined,
    query: { ...queryConfig, enabled: Boolean(forwardNode) },
  })

  return {
    resolvedAddress: resolvedAddress && resolvedAddress !== zeroAddress ? resolvedAddress : null,
    resolvedName: resolvedName || null,
    isResolvingAddress,
    addressError,
    nameError,
  }
}

export default useWeb3Name
