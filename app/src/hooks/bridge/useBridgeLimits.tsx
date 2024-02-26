import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { ForeignOmniMediator__factory, HomeBridgeErcToNative__factory } from '@/types/typechain'
import useSWR from 'swr'
import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { isSameString } from '@/src/utils/tools'

const useBridgeLimits = (
  fromChainId: ChainsValues,
  tokenAddress: string | undefined,
  // bridgeType: BridgeType,
) => {
  // Hardcoded condition
  // For Mainnet ETH, the address comes as 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
  // and we need to use 0x.
  const auxTokenAddress =
    tokenAddress == NATIVE_TOKEN_ADDRESS.toLowerCase() ? ZERO_ADDRESS : tokenAddress

  return useSWR(
    fromChainId && auxTokenAddress
      ? [`bridgeLimits-${auxTokenAddress}-${fromChainId}`, auxTokenAddress, fromChainId]
      : null,
    async ([, _tokenAddress]) => {
      const rpcUrl = new JsonRpcBatchProvider(chainsConfig[fromChainId].rpcUrl)

      if (
        (fromChainId == Chains.gnosis && isSameString(_tokenAddress, ZERO_ADDRESS)) ||
        (fromChainId != Chains.gnosis &&
          isSameString(_tokenAddress, chainsConfig[fromChainId].bridge.DAI))
      ) {
        const contract = HomeBridgeErcToNative__factory.connect(
          contracts.XDAIBridge.address[fromChainId],
          rpcUrl,
        )

        const currentDay = await contract.getCurrentDay()

        const [dailyLimit, minPerTx, maxPerTx, totalSpentPerDay] = await Promise.all([
          contract.dailyLimit(),
          contract.minPerTx(),
          contract.maxPerTx(),
          contract.totalSpentPerDay(currentDay),
        ])

        return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
      } else {
        const contract = ForeignOmniMediator__factory.connect(
          contracts.OmniBridge.address[fromChainId],
          rpcUrl,
        )

        const currentDay = await contract.getCurrentDay()

        const [dailyLimit, minPerTx, maxPerTx, totalSpentPerDay] = await Promise.all([
          contract.dailyLimit(_tokenAddress),
          contract.minPerTx(_tokenAddress),
          contract.maxPerTx(_tokenAddress),
          contract.totalSpentPerDay(_tokenAddress, currentDay),
        ])

        return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
      }
    },
    {
      suspense: false,
    },
  )
}

export default useBridgeLimits
