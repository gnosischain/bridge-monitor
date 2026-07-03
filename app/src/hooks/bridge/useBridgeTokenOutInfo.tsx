import { useEffect, useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { Address, zeroAddress } from 'viem'

import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS, USDS_ADDRESS } from '@/src/constants/config/common'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { TokenOverrideManager } from '@/src/utils/token-overrides'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { contracts } from '@/src/constants/config/contracts'
import { USDC_ETHEREUM, USDCe_GNOSIS } from '@/src/constants/misc'
import { usdcTokens } from '@/src/constants/usdcTokens'
import { xdaiToken } from '@/src/constants/xdaiToken'
import { usdsToken } from '@/src/constants/usdsToken'

/**
 * The destination token address is either statically known (overrides + native/DAI/wrapped-native
 * branches) or must be read from the omni mediator (the ERC-20 default). Only the `read` case hits
 * the chain, so it's the single wagmi `useReadContract` this hook performs.
 */
type TokenOutPlan =
  | { kind: 'static'; tokenOutAddress: string }
  | {
      kind: 'read'
      functionName: 'homeTokenAddress' | 'foreignTokenAddress'
      tokenAddress: Address
    }

/**
 * Fixed destination token for the special-cased bridge pairs (xDAI/USDS and the USDC ↔ USDC.e
 * mappings). Returns null when no special case applies and the token-out address must be resolved
 * from config or on-chain.
 */
const getSpecialTokenOut = ({
  fromChainId,
  receiveUsds,
  toChainId,
  tokenAddress,
}: {
  fromChainId: ChainsValues
  receiveUsds: boolean
  toChainId: ChainsValues
  tokenAddress: string
}): Token | null => {
  if (receiveUsds && fromChainId === Chains.gnosis) {
    return usdsToken
  }

  if (
    fromChainId === Chains.mainnet &&
    toChainId === Chains.gnosis &&
    isSameString(tokenAddress, USDC_ETHEREUM)
  ) {
    return usdcTokens.usdceGnosis
  }

  if (
    fromChainId === Chains.gnosis &&
    toChainId === Chains.mainnet &&
    isSameString(tokenAddress, USDCe_GNOSIS)
  ) {
    return usdcTokens.usdcMainnet
  }

  if (fromChainId === Chains.mainnet && isSameString(tokenAddress, USDS_ADDRESS)) {
    return xdaiToken
  }

  return null
}

/**
 * Builds the plan for resolving the destination token address: either a statically known address
 * or a descriptor for the single omni-mediator read needed for ERC-20s. Returns null for invalid
 * params.
 * @param fromChainId The ID of the chain where the token is being sent from.
 * @param receiveNativeToken A boolean indicating whether the token is received as a native token.
 * @param receiveUsds A boolean indicating whether USDS is received (xDAI -> USDS).
 * @param toChainId The ID of the chain where the token is being sent to.
 * @param tokenAddress The address of the token.
 * @returns a `static` plan (address known off-chain) or a `read` plan (omni-mediator lookup).
 */
const getTokenOutPlan = ({
  fromChainId,
  receiveNativeToken,
  receiveUsds,
  toChainId,
  tokenAddress,
}: {
  toChainId: ChainsValues
  fromChainId: ChainsValues
  tokenAddress: string
  receiveNativeToken: boolean
  receiveUsds: boolean
}): TokenOutPlan | null => {
  const { isDAI, isFromForeign, isFromHome, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })
  //---------------
  // Overrides
  //---------------
  if (TokenOverrideManager.isOverridden(tokenAddress)) {
    return {
      kind: 'static',
      tokenOutAddress: TokenOverrideManager.getOverride(tokenAddress).tokenOutAddress,
    }
  }

  //---------------
  // foreign > Gnosis
  //---------------

  if (isFromForeign) {
    if (isDAI) {
      return { kind: 'static', tokenOutAddress: NATIVE_TOKEN_ADDRESS }
    }

    // Native (form example ETH)
    // we use this one to detect that the token on the other side is WETH.
    if (isNativeToken) {
      return { kind: 'static', tokenOutAddress: chainsConfig[Chains.gnosis].bridge.wForeignNative }
    }

    // default to ERC20
    return { kind: 'read', functionName: 'homeTokenAddress', tokenAddress: tokenAddress as Address }
  }

  //---------------
  // Gnosis > foreign
  //---------------

  if (isFromHome) {
    // xDAI -> DAI
    if (receiveUsds) {
      return { kind: 'static', tokenOutAddress: USDS_ADDRESS }
    }

    if (isNativeToken) {
      return { kind: 'static', tokenOutAddress: chainsConfig[toChainId].bridge.DAI }
    }

    // WETH > ETH or WETH
    if (isSameString(chainsConfig[Chains.gnosis].bridge.wForeignNative, tokenAddress)) {
      return {
        kind: 'static',
        tokenOutAddress: receiveNativeToken
          ? NATIVE_TOKEN_ADDRESS
          : chainsConfig[toChainId].bridge.wForeignNative,
      }
    }

    // default to ERC20
    return {
      kind: 'read',
      functionName: 'foreignTokenAddress',
      tokenAddress: tokenAddress as Address,
    }
  }

  return null
}

export const useBridgeTokenOutInfo = ({
  fromChainId,
  receiveNativeToken,
  receiveUsds,
  toChainId,
  token,
}: {
  receiveNativeToken: boolean
  receiveUsds: boolean
  toChainId: ChainsValues
  fromChainId: ChainsValues
  token?: Token
}): Token | undefined => {
  const { tokensByNetwork } = useBridgedTokens()
  const toTokensList = tokensByNetwork[toChainId]

  const shouldFetch = !!(token && fromChainId && toChainId)

  const { plan, specialToken } = useMemo(() => {
    if (!shouldFetch || !token) {
      return { plan: null, specialToken: null }
    }

    const special = getSpecialTokenOut({
      fromChainId,
      receiveUsds,
      toChainId,
      tokenAddress: token.address,
    })

    if (special) {
      return { plan: null, specialToken: special }
    }

    return {
      plan: getTokenOutPlan({
        fromChainId,
        receiveNativeToken,
        receiveUsds,
        toChainId,
        tokenAddress: token.address,
      }),
      specialToken: null,
    }
  }, [shouldFetch, token, fromChainId, toChainId, receiveNativeToken, receiveUsds])

  // The omni mediator lives on Gnosis; only the `read` plan actually hits the chain.
  const readPlan = plan?.kind === 'read' ? plan : null
  const { data: readTokenOutAddress, error } = useReadContract({
    address: contracts.OmniBridge.address[Chains.gnosis],
    abi: contracts.OmniBridge.abi,
    functionName: readPlan?.functionName ?? 'homeTokenAddress',
    args: [readPlan?.tokenAddress ?? zeroAddress],
    chainId: Chains.gnosis,
    query: { enabled: !!readPlan },
  })

  useEffect(() => {
    if (error) {
      console.error('Error fetching token out info', error)
    }
  }, [error])

  return useMemo(() => {
    if (!shouldFetch || !token) {
      return undefined
    }

    if (specialToken) {
      return specialToken
    }

    if (!plan) {
      return undefined
    }

    const tokenOutAddress =
      plan.kind === 'static' ? plan.tokenOutAddress : (readTokenOutAddress as string | undefined)

    // still resolving the on-chain address
    if (tokenOutAddress === undefined) {
      return undefined
    }

    // if tokenOutAddress is ZERO ADDRESS is a new token on the other chain and we need to handle it
    if (tokenOutAddress === zeroAddress) {
      return { ...token, address: undefined, chainId: toChainId } as unknown as Token
    }

    // get the token from the list if it exists
    const receivedToken = toTokensList?.find((t) => isSameString(t.address, tokenOutAddress))

    if (receivedToken) {
      return receivedToken
    }

    // if the token is not in the list we return the token with the new address
    return { ...token, address: tokenOutAddress, chainId: toChainId }
  }, [shouldFetch, token, specialToken, plan, readTokenOutAddress, toTokensList, toChainId])
}
