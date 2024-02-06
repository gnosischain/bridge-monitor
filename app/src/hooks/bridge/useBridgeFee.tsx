import { BigNumberish } from 'ethers'
import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'

export const foreignToHomeFeeKey =
  '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625'
export const homeToForeignFeeKey =
  '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26'

export const useBridgeFee = ({
  amount,
  foreignChainId,
  isFromHome,
  isNativeBridge,
  token,
}: {
  amount: BigNumberish
  foreignChainId: ChainsValues
  isFromHome: boolean
  isNativeBridge: boolean
  token?: Token
}) => {
  const { bridgeContracts } = useBridgeContracts(foreignChainId)
  const shouldFetch = token && foreignChainId && amount

  return useSWR(
    shouldFetch ? [token, amount, 'bridgeFee'] : null,
    async ([_token, _amount]) => {
      if (isNativeBridge) {
        return isFromHome
          ? bridgeContracts.homeNativeBridge.getHomeFee()
          : bridgeContracts.homeNativeBridge.getForeignFee()
      } else {
        return isFromHome
          ? bridgeContracts.omniFeeManager.calculateFee(
              homeToForeignFeeKey,
              _token.address,
              _amount,
            )
          : bridgeContracts.omniFeeManager.calculateFee(
              foreignToHomeFeeKey,
              _token.address,
              _amount,
            )
      }
    },
    { suspense: false },
  )
}
