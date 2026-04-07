import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { USDC_ETHEREUM, USDCe_GNOSIS } from '@/src/constants/misc'
import { useMemo } from 'react'
import {
  contracts,
  foreignXdaiBridgeContract,
  homeXdaiBridgeContract,
  nativeOmniBridgeMediatorContract,
  usdsDepositContract,
} from '@/src/constants/config/contracts'
import { TOKEN_MODE, useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { getBridgeContractAddress } from '@/src/hooks/bridge/useBridgeContracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { isSameString } from '@/src/utils/tools'
import { TRANSMUTER_ADDRESS } from '@/src/constants/misc'
import { chainsConfig } from '@/src/constants/config/chains'
import { USDS_ADDRESS } from '@/src/constants/config/common'
import { encodeAbiParameters, encodeFunctionData, erc20Abi } from 'viem'
import erc677Abi from '@/src/abis/ERC677'
import foreignOmniMediatorAbi from '@/src/abis/ForeignOmniMediator'
import homeOmniMediatorAbi from '@/src/abis/HomeOmniMediator'
import foreignBridgeRouterAbi from '@/src/abis/ForeignBridgeRouter'

/**
 * isNativeToken && isFromForeign: use wrapAndRelayTokens (nativeOmniBridgeMediator) (no need approve: infinite approve) -> ETH -> WETH
 * isNativeToken && isFromHome && recipient: use relayTokens (homeBridgeErcToNative) (no need approve: infinite approve) -> xDAI -> DAI
 * isNativeToken && isFromHome && !recipient: use sendTransaction (from signer) (homeBridgeErcToNative) (no need approve: infinite approve) -> xDAI -> DAI
 * !isNativeToken && isFromForeign && !isDAI: use approve and relayTokens (foreignOmniMediator) (never use transfer) -> WETH -> WETH
 * !isNativeToken && isFromForeign && isDAI (receive native-xdai on home ): use approve and relayTokens (foreignBridgeErcToNative) -> DAI -> xDAI
 * !isNativeToken && isFromForeign && isDAI (receive DAI on home): use approve and relayTokens (foreignOmniMediator) -> DAI -> DAI
 * !isNativeToken && isFromHome && recipient (non compatible with ERC677/ERC827): use approve and relayTokens (homeOmniMediator) -> WETH -> WETH
 * !isNativeToken && isFromHome && !recipient (non compatible with ERC677/ERC827): use approve and transfer (from token contract) (homeOmniMediator) -> WETH -> WETH
 * !isNativeToken && isFromHome && recipient (compatible with ERC677/ERC827): use transferAndCall (without approve) (from token contract) (homeOmniMediator) -> WETH -> WETH
 * !isNativeToken && isFromHome && !recipient (compatible with ERC677/ERC827): use transferAndCall (without approve) (from token contract) (homeOmniMediator) -> WETH -> WETH
 * If I want to receive native token on foreign chain, it is possible? -> WETH -> ETH?
 *
 */

/**
 * Handles the wrapping and relaying of native tokens from the foreign chain to the home chain using the bridge contract.
 *
 * @param bridgeContractAddress - NativeOmniBridgeMediator (Native Omni Bridge)
 * @param amount - The amount of tokens to be wrapped and relayed.
 * @param walletAddress - (Optional) The recipient address on the home chain. If not provided, the signer's address will be used.
 * @returns An object containing the transaction data.
 */
const handleNativeTokenFromForeign = ({
  amount,
  bridgeContractAddress,
  walletAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  walletAddress: string
}) => {
  const callData = encodeFunctionData({
    abi: nativeOmniBridgeMediatorContract.abi,
    functionName: 'wrapAndRelayTokens',
    args: [walletAddress as `0x${string}`],
  })
  return {
    to: bridgeContractAddress as `0x${string}`,
    value: amount,
    data: callData,
    title: 'Wrap and relay tokens',
  }
}

/**
 * Handles the transfer of native tokens from the home bridge contract.
 *
 * @param bridgeContractAddress - The HomeBridgeErcToNative contract instance (xDAI Bridge).
 * @param amount - The amount of tokens to transfer.
 * @param recipient - Optional recipient address for the transfer.
 * @returns An object containing the transaction data.
 */
const handleNativeTokenFromHome = ({
  amount,
  bridgeContractAddress,
  fromChainId,
  recipient,
  toTokenAddress,
  userAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  userAddress: string
  fromChainId: ChainsValues
  recipient?: string
  toTokenAddress?: string
}) => {
  // Using the default estimateGas calculation using the minimum xDAI amount (10) to avoid crash when the user tries to bridge all the balance of the native tokens
  // TODO: There should be a better way to handle this.
  if (toTokenAddress && isSameString(toTokenAddress, USDS_ADDRESS)) {
    const usdsDepositAddress = contracts.USDSDeposit.address[fromChainId]
    if (!usdsDepositAddress) {
      throw new Error('USDSDeposit address not configured for this chain')
    }

    const targetRecipient = recipient || userAddress

    const callData = encodeFunctionData({
      abi: usdsDepositContract.abi,
      functionName: 'relayTokens',
      args: [targetRecipient as `0x${string}`],
    })
    return {
      to: usdsDepositAddress as `0x${string}`,
      value: amount,
      data: callData,
      title: 'Relay tokens',
    }
  }

  if (recipient) {
    const callData = encodeFunctionData({
      abi: homeXdaiBridgeContract.abi,
      functionName: 'relayTokens',
      args: [recipient as `0x${string}`],
    })
    return {
      to: bridgeContractAddress as `0x${string}`,
      value: amount,
      data: callData,
      title: 'Relay tokens',
    }
  }

  return {
    to: bridgeContractAddress as `0x${string}`,
    value: amount,
    title: 'Send tokens',
  }
}

/**
 * Handles the transfer of ERC20 tokens from foreign chain.
 * If the token is DAI, the transfer will be made using the xDAI bridge.
 * @param bridgeContractAddress The bridge contract instance (ForeignOmniMediator or ForeignBridgeErcToNative).
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param isDAI Optional. Indicates if the token is DAI.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the transaction data.
 */
const handleERC20TokenFromForeign = ({
  allowance,
  amount,
  bridgeContractAddress,
  isDAI,
  recipient,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  tokenAddress: string
  allowance: bigint
  tokenMode: TOKEN_MODE
  recipient: string | undefined
  userAddress: string
  isDAI?: boolean
}) => {
  // Quick fix to avoid useBridgeValidations to error when an approval is needed.
  // If an approval is needed the gasLimit should be calculated for the approval operation and not for the bridge operation.
  // If that not happens the estimateGas will fail because the allowance is not enough.
  //
  // TODO: If an approval is needed, "gasLimit" will be set with the value the approval operation will take.
  // But "tx" will have the bridge operation. It would be good to solve this inconsistency.
  // And then remove the useApproval hook and call the approve using the tx function returned by this function.

  const walletAddress = recipient || userAddress
  const isDedicatedERC20 = tokenMode === 'D-ERC20'
  const isERC677 = tokenMode === 'ERC677'

  // DAI token handling
  if (isDAI) {
    if (amount > allowance) {
      const callData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [bridgeContractAddress as `0x${string}`, amount],
      })
      return {
        to: tokenAddress as `0x${string}`,
        data: callData,
        title: 'Approve tokens',
      }
    }

    const callData = encodeFunctionData({
      abi: foreignXdaiBridgeContract.abi,
      functionName: 'relayTokens',
      args: [
        recipient
          ? (recipient.toLowerCase() as `0x${string}`)
          : (userAddress.toLowerCase() as `0x${string}`),
        amount,
      ],
    })
    return {
      to: bridgeContractAddress as `0x${string}`,
      data: callData,
      title: 'Relay tokens',
    }
  }

  if (!isERC677 && amount > allowance) {
    const callData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [bridgeContractAddress as `0x${string}`, amount],
    })
    return {
      to: tokenAddress as `0x${string}`,
      data: callData,
      title: 'Approve tokens',
    }
  }

  // ERC677: transferAndCall
  if (isERC677) {
    const callData = encodeFunctionData({
      abi: erc677Abi,
      functionName: 'transferAndCall',
      args: [bridgeContractAddress as `0x${string}`, amount, walletAddress as `0x${string}`],
    })
    return {
      to: tokenAddress as `0x${string}`,
      data: callData,
      title: 'Transfer and call',
    }
  }

  // Dedicated ERC20: relayTokens(address, uint256)
  if (isDedicatedERC20) {
    const callData = encodeFunctionData({
      abi: foreignOmniMediatorAbi,
      functionName: 'relayTokens',
      args: [walletAddress as `0x${string}`, amount],
    })
    return {
      to: bridgeContractAddress as `0x${string}`,
      data: callData,
      title: 'Relay tokens',
    }
  }

  // Standard ERC20: relayTokens(address, address, uint256)
  const callData = encodeFunctionData({
    abi: foreignOmniMediatorAbi,
    functionName: 'relayTokens',
    args: [tokenAddress as `0x${string}`, walletAddress as `0x${string}`, amount],
  })
  return {
    to: bridgeContractAddress as `0x${string}`,
    data: callData,
    title: 'Relay tokens',
  }
}

/**
 * Handles the transfer of ERC20 tokens from home.
 * If the token is compatible with ERC677/ERC827, it uses the transferAndCall method and avoids the approve step.
 * @param bridgeContractAddress The HomeOmniMediator contract instance.
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the token contract.
 * @param walletAddress Optional. The address of the recipient. If not provided, the tokens will be transferred to the bridge contract.
 * @param isERC677 Optional. Specifies whether the token is ERC677 compatible. Defaults to false.
 * @returns An object containing the transaction data.
 */
const handleERC20TokenFromHome = ({
  allowance,
  amount,
  bridgeContractAddress,
  receiveNativeToken,
  recipient,
  toChainId,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  tokenAddress: string
  tokenMode: TOKEN_MODE
  userAddress: string
  toChainId: ChainsValues
  recipient?: string
  receiveNativeToken?: boolean
  allowance?: bigint
}) => {
  // Here we have two cases. If the token is compatible with ERC677/ERC827 we should use transferAndCall method and avoid the approve step.
  const isERC677 = tokenMode === 'ERC677'
  const isDedicatedERC20 = tokenMode === 'D-ERC20'

  const walletAddress = recipient || userAddress

  // byteData info in: https://docs.tokenbridge.net/eth-xdai-amb-bridge/multi-token-extension/transfer-weth-from-xdai-to-eth-on-mainnet
  const bytesData = receiveNativeToken
    ? `${contracts.omniBridgeNativeToken.address[toChainId]}${walletAddress.replace('0x', '')}`
    : walletAddress

  // ERC20 => tokenAddress.approve(mediator, amount) => mediator.relayTokens(received, amount)
  // ERC677 =>  tokenAddress.transferAndCall(mediator)
  // dedicatedErc20 => mediator.relayTokens(received, amount)

  //
  if (isERC677) {
    const callData = encodeFunctionData({
      abi: erc677Abi,
      functionName: 'transferAndCall',
      args: [bridgeContractAddress as `0x${string}`, amount, bytesData as `0x${string}`],
    })
    return {
      to: tokenAddress as `0x${string}`,
      data: callData,
      title: 'Transfer and call',
    }
  }

  if (isDedicatedERC20) {
    const callData = encodeFunctionData({
      abi: homeOmniMediatorAbi,
      functionName: 'relayTokens',
      args: [walletAddress as `0x${string}`, amount],
    })
    return {
      to: bridgeContractAddress as `0x${string}`,
      data: callData,
      title: 'Relay tokens',
    }
  }

  // ERC20
  if (allowance && amount > allowance) {
    const callData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [bridgeContractAddress as `0x${string}`, amount],
    })
    return {
      to: tokenAddress as `0x${string}`,
      data: callData,
      title: 'Approve tokens',
    }
  }

  // Standard ERC20: relayTokens(address, address, uint256)
  const callData = encodeFunctionData({
    abi: homeOmniMediatorAbi,
    functionName: 'relayTokens',
    args: [tokenAddress as `0x${string}`, (recipient || walletAddress) as `0x${string}`, amount],
  })
  return {
    to: bridgeContractAddress as `0x${string}`,
    data: callData,
    title: 'Relay tokens',
  }
}

/**
 * Handles the transfer of ERC20 tokens from foreign chain.
 * @param bridgeContractAddress The bridge contract instance (ForeignOmniMediator).
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param isDAI Optional. Indicates if the token is DAI.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the transaction data.
 */
const handleUsdceFromHome = ({
  allowance,
  amount,
  bridgeContractAddress,
  recipient,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  tokenAddress: string
  allowance: bigint
  tokenMode: TOKEN_MODE
  recipient: string | undefined
  userAddress: string
}) => {
  // Quick fix to avoid useBridgeValidations to error when an approval is needed.
  // If an approval is needed the gasLimit should be calculated for the approval operation and not for the bridge operation.
  // If that not happens the estimateGas will fail because the allowance is not enough.
  //
  // TODO: If an approval is needed, "gasLimit" will be set with the value the approval operation will take.
  // But "tx" will have the bridge operation. It would be good to solve this inconsistency.
  // And then remove the useApproval hook and call the approve using the tx function returned by this function.

  const walletAddress = recipient || userAddress
  const isERC677 = tokenMode === 'ERC677'

  const bytesData = encodeAbiParameters([{ type: 'address' }], [walletAddress as `0x${string}`])

  // ERC20 needs approval
  if (!isERC677 && amount > allowance) {
    const callData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [bridgeContractAddress as `0x${string}`, amount],
    })
    return {
      to: tokenAddress as `0x${string}`,
      data: callData,
      title: 'Approve tokens',
    }
  }

  // relayTokensAndCall
  const callData = encodeFunctionData({
    abi: homeOmniMediatorAbi,
    functionName: 'relayTokensAndCall',
    args: [tokenAddress as `0x${string}`, TRANSMUTER_ADDRESS as `0x${string}`, amount, bytesData],
  })
  return {
    to: bridgeContractAddress as `0x${string}`,
    data: callData,
    title: 'Relay tokens and call',
  }
}

/**
 * Handles the transfer of ERC20 tokens from foreign chain.
 * @param bridgeContractAddress The bridge contract instance (ForeignOmniMediator).
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param isDAI Optional. Indicates if the token is DAI.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the transaction data.
 */
const handleUsdcFromForeign = ({
  allowance,
  amount,
  bridgeContractAddress,
  recipient,
  tokenAddress,
  tokenMode,
  userAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  tokenAddress: string
  allowance: bigint
  tokenMode: TOKEN_MODE
  recipient: string | undefined
  userAddress: string
}) => {
  // Quick fix to avoid useBridgeValidations to error when an approval is needed.
  // If an approval is needed the gasLimit should be calculated for the approval operation and not for the bridge operation.
  // If that not happens the estimateGas will fail because the allowance is not enough.
  //
  // TODO: If an approval is needed, "gasLimit" will be set with the value the approval operation will take.
  // But "tx" will have the bridge operation. It would be good to solve this inconsistency.
  // And then remove the useApproval hook and call the approve using the tx function returned by this function.

  const walletAddress = recipient || userAddress
  const isERC677 = tokenMode === 'ERC677'

  const bytesData = encodeAbiParameters([{ type: 'address' }], [walletAddress as `0x${string}`])

  // ERC20 needs approval
  if (!isERC677 && amount > allowance) {
    const callData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [bridgeContractAddress as `0x${string}`, amount],
    })
    return {
      to: tokenAddress as `0x${string}`,
      data: callData,
      title: 'Approve tokens',
    }
  }

  // relayTokensAndCall
  const callData = encodeFunctionData({
    abi: foreignOmniMediatorAbi,
    functionName: 'relayTokensAndCall',
    args: [tokenAddress as `0x${string}`, TRANSMUTER_ADDRESS as `0x${string}`, amount, bytesData],
  })
  return {
    to: bridgeContractAddress as `0x${string}`,
    data: callData,
    title: 'Relay tokens and call',
  }
}

/**
 * Handles the transfer of Dai and USDS tokens from foreign chain trough BridgeRouter
 * @param bridgeContractAddress The bridge contract instance (ForeignBridgeRouter).
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the transaction data.
 */
const handleUsdsOrDaiFromForeign = ({
  allowance,
  amount,
  bridgeContractAddress,
  recipient,
  tokenAddress,
  userAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  tokenAddress: string
  allowance: bigint
  recipient: string | undefined
  userAddress: string
}) => {
  const bridgeRouterContract = contracts.BridgeRouter.address[1]

  if (amount > allowance) {
    const callData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [bridgeRouterContract as `0x${string}`, amount],
    })
    return {
      to: tokenAddress as `0x${string}`,
      data: callData,
      title: 'Approve tokens',
    }
  }

  const callData = encodeFunctionData({
    abi: foreignBridgeRouterAbi,
    functionName: 'relayTokens',
    args: [
      tokenAddress as `0x${string}`,
      (recipient ? recipient.toLowerCase() : userAddress.toLowerCase()) as `0x${string}`,
      amount,
    ],
  })
  return {
    to: bridgeContractAddress as `0x${string}`,
    data: callData,
    title: 'Relay tokens',
  }
}

export const getBridgeTx = ({
  account,
  allowance,
  amount,
  // balance,
  fromChainId,
  receiveNativeToken,
  recipient,
  toChainId,
  toTokenAddress,
  tokenAddress,
  tokenMode,
}: {
  account: string
  amount: bigint
  allowance: bigint
  fromChainId: ChainsValues
  toChainId: ChainsValues
  tokenAddress: string
  tokenMode: TOKEN_MODE
  balance: bigint
  receiveNativeToken?: boolean
  recipient?: string
  toTokenAddress?: string
}) => {
  const bridgeContractAddress = getBridgeContractAddress(fromChainId, toChainId, tokenAddress)

  if (amount <= 0n || !account) {
    return null
  }

  const { isFromHome, isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress,
  })

  const isUsdcEth = isSameString(tokenAddress, USDC_ETHEREUM)
  const isUsdceGnosis = isSameString(tokenAddress, USDCe_GNOSIS)
  const isUsdsEth = isSameString(tokenAddress, chainsConfig[1].bridge.USDS)
  const isDaiEth = isSameString(tokenAddress, chainsConfig[1].bridge.DAI)

  if (isUsdsEth || isDaiEth) {
    return handleUsdsOrDaiFromForeign({
      bridgeContractAddress,
      amount,
      tokenAddress,
      userAddress: account,
      recipient,
      allowance,
    })
  }

  if (isUsdceGnosis) {
    return handleUsdceFromHome({
      bridgeContractAddress,
      amount,
      tokenAddress,
      userAddress: account,
      recipient,
      allowance,
      tokenMode,
    })
  }

  if (isUsdcEth) {
    return handleUsdcFromForeign({
      bridgeContractAddress,
      amount,
      tokenAddress,
      allowance,
      tokenMode,
      recipient,
      userAddress: account,
    })
  }

  if (isNativeToken) {
    if (isFromHome) {
      return handleNativeTokenFromHome({
        bridgeContractAddress,
        amount,
        recipient,
        fromChainId,
        userAddress: account,
        toTokenAddress,
      })
    }
    return handleNativeTokenFromForeign({
      bridgeContractAddress,
      amount,
      walletAddress: recipient || account,
    })
  }

  if (isFromHome) {
    return handleERC20TokenFromHome({
      bridgeContractAddress,
      amount,
      tokenAddress,
      toChainId,
      tokenMode,
      userAddress: account,
      recipient,
      receiveNativeToken,
      allowance,
    })
  }

  return handleERC20TokenFromForeign({
    bridgeContractAddress,
    amount,
    tokenAddress,
    allowance,
    tokenMode,
    recipient,
    userAddress: account,
    isDAI: isNativeBridge, // use nativeBridge for DAI
  })
}

export const useBridgeTransactionInfo = ({
  amount,
  fromChainId,
  receiveNativeToken,
  recipient,
  toChainId,
  toToken,
  token,
  userAddress,
}: {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: bigint
  receiveNativeToken: boolean
  recipient?: string
  token: Token
  toToken?: Token
}) => {
  const { walletChainId } = useWeb3Connection()
  if (walletChainId !== fromChainId) throw new Error('Invalid chain')

  const { data: tokenMode } = useTokenMode(fromChainId, toChainId, token)
  const { data: userBalancesData } = useUserTokenBalances({
    userAddress: userAddress,
    allowanceAddress: getBridgeContractAddress(fromChainId, toChainId, token.address),
    tokenAddress: token.address,
    chainId: fromChainId,
  })
  if (!userBalancesData) throw new Error('User balances are not available')

  const toTokenAddress = toToken ? toToken.address : undefined

  const txData = useMemo(() => {
    if (!tokenMode) return null
    return getBridgeTx({
      account: userAddress,
      amount,
      fromChainId,
      toChainId,
      tokenAddress: token.address,
      recipient,
      tokenMode,
      receiveNativeToken,
      allowance: userBalancesData.allowance,
      balance: userBalancesData.balance,
      toTokenAddress,
    })
  }, [
    userAddress,
    amount,
    fromChainId,
    toChainId,
    token.address,
    recipient,
    tokenMode,
    receiveNativeToken,
    userBalancesData.allowance,
    userBalancesData.balance,
    toTokenAddress,
  ])

  return { data: { txData } }
}
