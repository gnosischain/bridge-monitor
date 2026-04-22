import { Chains } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { contracts } from '@/src/constants/config/contracts'
import { useReadContract } from 'wagmi'

export const foreignToHomeFeeKey =
  '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625'
export const homeToForeignFeeKey =
  '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26'

export const useBridgeFee = ({
  amount,
  isFromHome,
  isNativeBridge,
  token,
}: {
  amount: bigint
  isFromHome: boolean
  isNativeBridge: boolean
  token: Token
}) => {
  const { data: homeFee } = useReadContract({
    address: contracts.XDAIBridge.address[Chains.gnosis],
    abi: contracts.XDAIBridge.abi,
    functionName: 'getHomeFee',
    chainId: Chains.gnosis,
    query: { enabled: isNativeBridge && isFromHome },
  })

  const { data: foreignFee } = useReadContract({
    address: contracts.XDAIBridge.address[Chains.gnosis],
    abi: contracts.XDAIBridge.abi,
    functionName: 'getForeignFee',
    chainId: Chains.gnosis,
    query: { enabled: isNativeBridge && !isFromHome },
  })

  const { data: omniFee } = useReadContract({
    address: contracts.omnibridgeFeeManager.address[Chains.gnosis],
    abi: contracts.omnibridgeFeeManager.abi,
    functionName: 'calculateFee',
    args: [
      isFromHome ? homeToForeignFeeKey : foreignToHomeFeeKey,
      token.address as `0x${string}`,
      amount,
    ],
    chainId: Chains.gnosis,
    query: { enabled: !isNativeBridge },
  })

  const data = isNativeBridge ? (isFromHome ? homeFee : foreignFee) : omniFee

  return { data }
}
