import { BigNumber } from 'ethers'
import { Chains } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { HomeBridgeErcToNative__factory, OmniBridgeFeeManager__factory } from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { chainsConfig } from '@/src/constants/config/chains'

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
  return useSWR(['bridgeFee', token, amount], async ([, _token, _amount]) => {
    const gnosisRpc = new JsonRpcBatchProvider(chainsConfig[Chains.gnosis].rpcUrl)

    if (isNativeBridge) {
      const contract = HomeBridgeErcToNative__factory.connect(
        contracts.XDAIBridge.address[Chains.gnosis],
        gnosisRpc,
      )

      return isFromHome ? contract.getHomeFee() : contract.getForeignFee()
    } else {
      const omniFeeManager = OmniBridgeFeeManager__factory.connect(
        contracts.omnibridgeFeeManager.address[Chains.gnosis],
        gnosisRpc,
      )

      return omniFeeManager.calculateFee(
        isFromHome ? homeToForeignFeeKey : foreignToHomeFeeKey,
        _token.address,
        _amount,
      )
    }
  })
}
