import { BigNumberish } from 'ethers'
import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { foreignToHomeFeeKey, homeToForeignFeeKey } from '@/src/hooks/bridge/useBridgeInfo'

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
