import { Chains, ChainsValues } from '@/src/constants/config/types'
import { chainsConfig } from '@/src/constants/config/chains'
import { isNativeToken as defaultIsNativeToken, isSameString } from '@/src/utils/tools'

/**
 * Handles the common bridge information based on the provided parameters.
 * @param fromChainId The ID of the source chain.
 * @param toChainId The ID of the destination chain.
 * @param tokenAddress The address of the token being bridged.
 * @param receiveNativeToken Optional. Indicates whether the token being bridged is received as a native token.
 * @returns An object containing various bridge-related information.
 */
export const getBridgeCommonInfo = ({
  fromChainId,
  toChainId,
  tokenAddress,
}: {
  fromChainId: ChainsValues
  toChainId: ChainsValues
  tokenAddress: string
}) => {
  const isFromHome = fromChainId === Chains.gnosis
  const isFromForeign = !isFromHome
  const isNativeToken = defaultIsNativeToken(tokenAddress)
  const isDAI = isSameString(chainsConfig[fromChainId].bridge.DAI, tokenAddress)
  const isUSDS = isSameString(chainsConfig[fromChainId].bridge.USDS, tokenAddress)

  const isNativeBridge =
    !!(isFromHome && isNativeToken) || !!(isFromForeign && isDAI) || !!(isFromForeign && isUSDS) // native bridge == xDAI bridge

  const foreignChainId = isFromForeign ? fromChainId : toChainId

  return {
    foreignChainId,
    isFromHome,
    isFromForeign,
    isNativeToken,
    isDAI,
    isUSDS,
    isNativeBridge,
  }
}
