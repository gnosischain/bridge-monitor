import { Token } from '@/types/token'
import {
  homeXdaiBridgeContract,
  omniBridgeFeeManagerContract,
} from '@/src/constants/config/contracts'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'

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
  const { data: nativeBridgeFee } = useReadContract({
    ...homeXdaiBridgeContract,
    functionName: isFromHome ? 'getHomeFee' : 'getForeignFee',
    query: {
      enabled: isNativeBridge,
    },
  })

  const { data: omniBridgeFee } = useReadContract({
    ...omniBridgeFeeManagerContract,
    functionName: 'calculateFee',
    args: [
      isFromHome ? homeToForeignFeeKey : foreignToHomeFeeKey,
      token.address as Address,
      amount,
    ],
    query: {
      enabled: !isNativeBridge,
    },
  })

  return isNativeBridge ? nativeBridgeFee : omniBridgeFee
}
