import { JsonRpcBatchProvider } from '@ethersproject/providers'
import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import {
  HomeBridgeErcToNative,
  HomeBridgeErcToNative__factory,
  HomeOmniMediator,
  HomeOmniMediator__factory,
} from '@/types/typechain'
import useSWR from 'swr'
import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { ZERO_ADDRESS, ZERO_BN } from '@/src/constants/misc'
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { BigNumber } from 'ethers'
import { getOverridden, isMediatorOverridden } from '@/src/utils/token-overrides'

/**
 * Retrieves the default token limits for a bridge transaction.
 * Used when doesnt exists a destination token.
 * @param decimals - The number of decimal places for the token.
 * @param fromChainId - The ID of the chain where the token is being transferred from.
 * @param toChainId - The ID of the chain where the token is being transferred to.
 * @returns An object containing the minimum per transaction, maximum per transaction, daily limit, and total spent per day.
 */
const getDefaultTokenLimits = async (
  decimals: number,
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
) => {
  try {
    const [fromMediatorContract, toMediatorContract] = [
      HomeOmniMediator__factory.connect(
        contracts.OmniBridge.address[fromChainId],
        new JsonRpcBatchProvider(chainsConfig[fromChainId].rpcUrl),
      ),
      HomeOmniMediator__factory.connect(
        contracts.OmniBridge.address[toChainId],
        new JsonRpcBatchProvider(chainsConfig[toChainId].rpcUrl),
      ),
    ]

    let [minPerTx, maxPerTx, dailyLimit] = await Promise.all([
      fromMediatorContract.minPerTx(ZERO_ADDRESS),
      toMediatorContract.executionMaxPerTx(ZERO_ADDRESS),
      fromMediatorContract.executionDailyLimit(ZERO_ADDRESS),
    ])

    if (decimals < 18) {
      const factor = BigNumber.from(10).pow(18 - decimals)

      minPerTx = minPerTx.div(factor)
      maxPerTx = maxPerTx.div(factor)
      dailyLimit = dailyLimit.div(factor)

      if (minPerTx.eq(0)) {
        minPerTx = BigNumber.from(1)
        if (maxPerTx.lte(minPerTx)) {
          maxPerTx = BigNumber.from(100)
          if (dailyLimit.lte(maxPerTx)) {
            dailyLimit = BigNumber.from(10000)
          }
        }
      }
    } else {
      const factor = BigNumber.from(10).pow(decimals - 18)

      minPerTx = minPerTx.mul(factor)
      maxPerTx = maxPerTx.mul(factor)
      dailyLimit = dailyLimit.mul(factor)
    }

    return {
      minPerTx,
      maxPerTx,
      dailyLimit,
      totalSpentPerDay: ZERO_BN,
    }
  } catch (error) {
    console.log(error)
    return {
      minPerTx: BigNumber.from(0),
      maxPerTx: BigNumber.from(0),
      dailyLimit: BigNumber.from(0),
      totalSpentPerDay: ZERO_BN,
    }
  }
}

const getBridgeLimits = async (
  contract: HomeBridgeErcToNative | HomeOmniMediator,
  tokenAddress: string | undefined,
) => {
  const currentDay = await contract.getCurrentDay()

  if (tokenAddress) {
    contract = contract as HomeOmniMediator
    const [dailyLimit, minPerTx, maxPerTx, totalSpentPerDay] = await Promise.all([
      contract.dailyLimit(tokenAddress),
      contract.minPerTx(tokenAddress),
      contract.maxPerTx(tokenAddress),
      contract.totalSpentPerDay(tokenAddress, currentDay),
    ])

    return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
  } else {
    contract = contract as HomeBridgeErcToNative
    const [dailyLimit, minPerTx, maxPerTx, totalSpentPerDay] = await Promise.all([
      contract.dailyLimit(),
      contract.minPerTx(),
      contract.maxPerTx(),
      contract.totalSpentPerDay(currentDay),
    ])

    return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
  }
}

const useBridgeLimits = (
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
  fromToken: Token | undefined,
  toToken: Token | undefined,
) => {
  // Hardcoded condition
  // For Mainnet ETH, the address comes as 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
  // and we need to use 0x.
  const fromTokenAddress =
    fromToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? ZERO_ADDRESS : fromToken?.address

  const toTokenAddress =
    toToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? ZERO_ADDRESS : toToken?.address

  return useSWR(
    fromChainId && fromTokenAddress
      ? [
          `bridgeLimits-${fromTokenAddress}-${fromChainId}`,
          fromTokenAddress,
          toTokenAddress,
          fromChainId,
        ]
      : null,
    async ([, _fromTokenAddress, _toTokenAddress]) => {
      const rpcUrl = new JsonRpcBatchProvider(chainsConfig[fromChainId].rpcUrl)

      if (
        (fromChainId == Chains.gnosis && isSameString(_fromTokenAddress, ZERO_ADDRESS)) ||
        (fromChainId != Chains.gnosis &&
          isSameString(_fromTokenAddress, chainsConfig[fromChainId].bridge.DAI)) ||
        isMediatorOverridden(_fromTokenAddress, fromChainId) // mediator overrides uses the same methods than "HomeBridgeErcToNative" to get the limits
      ) {
        const contractAddress = isMediatorOverridden(_fromTokenAddress, fromChainId)
          ? getOverridden(_fromTokenAddress).mediator // use the overridden mediator address.
          : contracts.XDAIBridge.address[fromChainId]

        const contract = HomeBridgeErcToNative__factory.connect(contractAddress, rpcUrl)

        const { dailyLimit, maxPerTx, minPerTx, totalSpentPerDay } = await getBridgeLimits(
          contract,
          undefined,
        )

        return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
      } else if (_toTokenAddress) {
        const contract = HomeOmniMediator__factory.connect(
          contracts.OmniBridge.address[fromChainId],
          rpcUrl,
        )

        const { dailyLimit, maxPerTx, minPerTx, totalSpentPerDay } = await getBridgeLimits(
          contract,
          _fromTokenAddress,
        )

        return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
      }

      return getDefaultTokenLimits(fromToken?.decimals || 18, fromChainId, toChainId)
    },
  )
}

export default useBridgeLimits
