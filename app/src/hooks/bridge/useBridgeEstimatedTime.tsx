import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { HomeBridgeErcToNative__factory } from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import { AMB__factory } from '@/types/typechain/factories/AMB__factory'

export const useBridgeEstimatedTime = (chainId: ChainsValues, isNativeBridge: boolean) =>
  useSWR(
    ['estimatedBridgeTime', chainId, isNativeBridge],
    async ([, _chainId, _isNativeBridge]) => {
      const chainConfig = getNetworkConfig(_chainId)
      const provider = new JsonRpcProvider(chainConfig.rpcUrl)

      const xdai = HomeBridgeErcToNative__factory.connect(
        contracts.XDAIBridge.address[_chainId],
        provider,
      )

      const omni = AMB__factory.connect(contracts.AMB.address[_chainId], provider)

      let blocks: BigNumber
      if (_isNativeBridge) {
        blocks = await xdai.requiredBlockConfirmations()
      } else {
        blocks = await omni.requiredBlockConfirmations()
      }

      return blocks.mul(chainConfig.blocksFrequencyInSeconds).toNumber()
    },
    { suspense: false },
  )
