import { Chains } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { contracts } from '@/src/constants/config/contracts'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import { HomeBridgeErcToNative__factory, OmniBridgeFeeManager__factory } from '@/types/typechain'

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
    address: contracts.XDAIBridge.address[Chains.gnosis] as Address,
    abi: HomeBridgeErcToNative__factory.abi,
    functionName: isFromHome ? 'getHomeFee' : 'getForeignFee',
    chainId: Chains.gnosis,
    query: {
      enabled: isNativeBridge,
    },
  })

  const { data: omniBridgeFee } = useReadContract({
    address: contracts.omnibridgeFeeManager.address[Chains.gnosis] as Address,
    abi: OmniBridgeFeeManager__factory.abi,
    functionName: 'calculateFee',
    args: [isFromHome ? homeToForeignFeeKey : foreignToHomeFeeKey, token.address as Address, amount],
    chainId: Chains.gnosis,
    query: {
      enabled: !isNativeBridge,
    },
  })

  return isNativeBridge ? nativeBridgeFee : omniBridgeFee
}
