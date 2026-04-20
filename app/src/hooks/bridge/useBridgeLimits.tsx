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
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { TokenOverrideManager } from '@/src/utils/token-overrides'
import { zeroAddress } from 'viem'
import { bnToBigInt } from '@/src/utils/bigNumber'

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
      fromMediatorContract.minPerTx(zeroAddress).then(bnToBigInt),
      toMediatorContract.executionMaxPerTx(zeroAddress).then(bnToBigInt),
      fromMediatorContract.executionDailyLimit(zeroAddress).then(bnToBigInt),
    ])

    if (decimals < 18) {
      const factor = 10n ** (18n - BigInt(decimals))

      minPerTx = minPerTx / factor
      maxPerTx = maxPerTx / factor
      dailyLimit = dailyLimit / factor

      if (minPerTx === 0n) {
        minPerTx = 1n
        if (maxPerTx <= minPerTx) {
          maxPerTx = 100n
          if (dailyLimit <= maxPerTx) {
            dailyLimit = 10000n
          }
        }
      }
    } else {
      const factor = 10n ** (BigInt(decimals) - 18n)

      minPerTx = minPerTx * factor
      maxPerTx = maxPerTx * factor
      dailyLimit = dailyLimit * factor
    }

    return {
      minPerTx,
      maxPerTx,
      dailyLimit,
      totalSpentPerDay: 0n,
    }
  } catch (error) {
    console.log(error)
    return {
      minPerTx: 0n,
      maxPerTx: 0n,
      dailyLimit: 0n,
      totalSpentPerDay: 0n,
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
      contract.dailyLimit(tokenAddress).then(bnToBigInt),
      contract.minPerTx(tokenAddress).then(bnToBigInt),
      contract.maxPerTx(tokenAddress).then(bnToBigInt),
      contract.totalSpentPerDay(tokenAddress, currentDay).then(bnToBigInt),
    ])

    return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
  } else {
    contract = contract as HomeBridgeErcToNative
    const [dailyLimit, minPerTx, maxPerTx, totalSpentPerDay] = await Promise.all([
      contract.dailyLimit().then(bnToBigInt),
      contract.minPerTx().then(bnToBigInt),
      contract.maxPerTx().then(bnToBigInt),
      contract.totalSpentPerDay(currentDay).then(bnToBigInt),
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
    fromToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? zeroAddress : fromToken?.address

  const toTokenAddress =
    toToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? zeroAddress : toToken?.address

  return useSWR(
    fromChainId && fromTokenAddress
      ? [
          `bridgeLimits-${fromTokenAddress}-${fromChainId}`,
          fromTokenAddress,
          toTokenAddress,
          fromChainId,
        ]
      : null,
    async ([, _fromTokenAddress, _toTokenAddress, _fromChainId]) => {
      const rpcUrl = new JsonRpcBatchProvider(chainsConfig[_fromChainId].rpcUrl)

      // mediator overrides uses the same methods than "HomeBridgeErcToNative" to get the limits
      const overwrittenMediator = TokenOverrideManager.isMediatorOverridden(
        _fromTokenAddress,
        _fromChainId,
      )
      const isGnosisXDai =
        _fromChainId == Chains.gnosis && isSameString(_fromTokenAddress, zeroAddress)
      const isForeignDAI =
        _fromChainId != Chains.gnosis &&
        isSameString(_fromTokenAddress, chainsConfig[_fromChainId].bridge.DAI)
      const isForeignUSDS =
        _fromChainId != Chains.gnosis &&
        isSameString(_fromTokenAddress, chainsConfig[_fromChainId].bridge.USDS)

      if (isGnosisXDai || isForeignDAI || overwrittenMediator || isForeignUSDS) {
        const contractAddress = overwrittenMediator
          ? TokenOverrideManager.getOverride(_fromTokenAddress).mediator // use the overridden mediator address.
          : contracts.XDAIBridge.address[_fromChainId]

        const contract = HomeBridgeErcToNative__factory.connect(contractAddress, rpcUrl)

        const { dailyLimit, maxPerTx, minPerTx, totalSpentPerDay } = await getBridgeLimits(
          contract,
          undefined,
        )

        return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
      } else if (_toTokenAddress) {
        const contract = HomeOmniMediator__factory.connect(
          contracts.OmniBridge.address[_fromChainId],
          rpcUrl,
        )

        const { dailyLimit, maxPerTx, minPerTx, totalSpentPerDay } = await getBridgeLimits(
          contract,
          _fromTokenAddress,
        )

        return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
      }

      // This branch is used when the destination token does not exist.
      // It's the first time a tokens is bridged.
      return getDefaultTokenLimits(fromToken?.decimals || 18, _fromChainId, toChainId)
    },
  )
}

export default useBridgeLimits
