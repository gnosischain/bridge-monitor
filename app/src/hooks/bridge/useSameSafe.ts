import { Address, parseAbi } from 'viem'
import { useBytecode, useReadContracts } from 'wagmi'

import { ChainsValues } from '@/src/constants/config/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const safeAbi = parseAbi([
  'function getOwners() view returns (address[])',
  'function getThreshold() view returns (uint256)',
])

// owners are a linked list, so each chain can return them in a different order.
// shortcut: a lookalike Safe deployed through the legacy CREATE factory can copy owners and threshold
// yet hide a module; checking how it was created (its CREATE2 setup) would close that
const safeKey = (owners?: readonly Address[], threshold?: bigint) =>
  owners && threshold !== undefined && `${threshold}/${[...owners].sort()}`

/**
 * Whether the connected wallet is the same on both chains: an EOA always is; a contract must be a
 * Safe with the same owners and threshold. No wallet gives `eoa`, a failed read `notSameSafe`.
 */
export const useSameSafe = (
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
): 'loading' | 'eoa' | 'sameSafe' | 'notSameSafe' => {
  const { address } = useWeb3Connection()

  const { data: code, isLoading: isLoadingCode } = useBytecode({
    address: address ?? undefined,
    chainId: fromChainId,
  })
  // EIP-7702: an EOA with a delegation has code `0xef0100 || delegate`, still an EOA
  const isEoa = code === null || !!code?.startsWith('0xef0100')

  const safe = { abi: safeAbi, address: address as Address }
  const { data, isLoading: isLoadingSafe } = useReadContracts({
    contracts: [
      { ...safe, chainId: fromChainId, functionName: 'getOwners' },
      { ...safe, chainId: fromChainId, functionName: 'getThreshold' },
      { ...safe, chainId: toChainId, functionName: 'getOwners' },
      { ...safe, chainId: toChainId, functionName: 'getThreshold' },
    ],
    // also runs when the code read failed, so that case ends up `notSameSafe`
    query: { enabled: !!address && !isLoadingCode && !isEoa },
  })

  if (isLoadingCode || isLoadingSafe) return 'loading'
  if (!address || isEoa) return 'eoa'

  const fromKey = safeKey(data?.[0].result, data?.[1].result)
  return fromKey && fromKey === safeKey(data?.[2].result, data?.[3].result)
    ? 'sameSafe'
    : 'notSameSafe'
}
