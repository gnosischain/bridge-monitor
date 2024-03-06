import { BigNumber } from 'ethers'
import { Chains } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { HomeBridgeErcToNative } from '@/types/typechain'

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
  amount: BigNumber
  isFromHome: boolean
  isNativeBridge: boolean
  token: Token
}) => {
  const { bridgeContracts } = useBridgeContracts()

  return useSWR(['bridgeFee', token, amount], async ([, _token, _amount]) => {
    if (isNativeBridge) {
      const contract = bridgeContracts(Chains.gnosis).XDAIBridge as HomeBridgeErcToNative
      return isFromHome ? contract.getHomeFee() : contract.getForeignFee()
    } else {
      return bridgeContracts(Chains.gnosis).omniFeeManager.calculateFee(
        isFromHome ? homeToForeignFeeKey : foreignToHomeFeeKey,
        _token.address,
        _amount,
      )
    }
  })
}
