import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { USDC_ETHEREUM, USDCe_GNOSIS, ZERO_BN } from '@/src/constants/misc'
import {
  ERC20__factory,
  ERC677,
  ERC677__factory,
  ForeignBridgeErcToNative,
  ForeignOmniMediator,
  HomeOmniMediator
} from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { TOKEN_MODE, useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { getBridgeContractAddress } from '@/src/hooks/bridge/useBridgeContracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { isSameString } from '@/src/utils/tools'
import { defaultAbiCoder } from 'ethers/lib/utils'
import { TRANSMUTER_ADDRESS } from '@/src/constants/misc'
import { chainsConfig } from '@/src/constants/config/chains'
import { USDS_ADDRESS } from '@/src/constants/config/common'

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
 * @param signer - The signer object used for signing transactions.
 * @param amount - The amount of tokens to be wrapped and relayed.
 * @param walletAddress - (Optional) The recipient address on the home chain. If not provided, the signer's address will be used.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleNativeTokenFromForeign = async ({
  amount,
  bridgeContractAddress,
  walletAddress,
}: {
  bridgeContractAddress: string
  amount: bigint
  walletAddress: string
}) => {
  // Using the default estimateGas calculation using the minimum ETH amount (0.000000000000000001) to avoid crash when the user tries to bridge all the balance of the native tokens
  // TODO: There should be a better way to handle this.
  const gasLimit = await bridgeContract.estimateGas['wrapAndRelayTokens(address)'](
    walletAddress,
    {
      value: amount.toString(),
    },
  )

  return {
    gasLimit,
    tx: async function () {
      return bridgeContract['wrapAndRelayTokens(address)'](walletAddress, {
        value: amount.toString(),
        gasLimit,
      })
    },
  }
}

/**
 * Handles the transfer of native tokens from the home bridge contract.
 *
 * @param bridgeContractAddress - The HomeBridgeErcToNative contract instance (xDAI Bridge).
 * @param amount - The amount of tokens to transfer.
 * @param recipient - Optional recipient address for the transfer.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleNativeTokenFromHome = async ({
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

    const usdsDeposit = new Contract(usdsDepositAddress, contracts.USDSDeposit.abi, signer)
    const targetRecipient = recipient || userAddress

    const gasLimit = await usdsDeposit.estimateGas.relayTokens(targetRecipient, {
      value: amount.toString(),
    })

    return {
      gasLimit,
      tx: async function () {
        return usdsDeposit.relayTokens(targetRecipient, {
          value: amount.toString(),
          gasLimit,
        })
      },
    }
  }

  const gasLimit = recipient
    ? await bridgeContract.estimateGas.relayTokens(recipient, {
        value: amount.toString(),
      })
    : await signer.estimateGas({
        to: bridgeContract.address,
        from: userAddress,
        value: amount.toString(),
      })

  return {
    gasLimit,
    tx: async function () {
      return recipient
        ? bridgeContract.relayTokens(recipient, {
            value: amount.toString(),
          })
        : signer.sendTransaction({
            to: bridgeContract.address,
            value: amount.toString(),
          })
    },
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
 * @returns An object containing the gas limit and a transaction function.
 */
const handleERC20TokenFromForeign = async ({
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
  const tokenContract = isERC677
    ? ERC677__factory.connect(tokenAddress, signer)
    : ERC20__factory.connect(tokenAddress, signer)

  let gasLimit: bigint
  if (isDAI) {
    if (amount > allowance) {
      gasLimit = await tokenContract.estimateGas.approve(bridgeContract.address, amount.toString())
    } else {
      gasLimit = await (bridgeContract as ForeignBridgeErcToNative).estimateGas.relayTokens(
        recipient ? recipient.toLowerCase() : userAddress.toLowerCase(),
        amount.toString(),
      )
    }

    return {
      gasLimit,
      tx: async function () {
        return (bridgeContract as ForeignBridgeErcToNative).relayTokens(
          recipient ? recipient.toLowerCase() : userAddress.toLowerCase(),
          amount.toString(),
          {
            gasLimit,
          },
        )
      },
    }
  }

  if (!isERC677 && amount > allowance) {
    try {
      gasLimit = await tokenContract.estimateGas.approve(bridgeContract.address, amount.toString())
    } catch (error) {
      gasLimit = 0n
      console.log('error', error)
    }
    // gasLimit = await tokenContract.estimateGas.approve(bridgeContract.address, amount.toString())
  } else {
    // Never use transfer in this case. Always use relayTokens.
    // Can we use transferAndCall here if the token is compatible with ERC677/ERC827???
    // For Dedicated ERC20 (D-ERC20), we need to use relayTokens(address,address) method instead of relayTokens(address,address,uint256)
    if (isERC677) {
      gasLimit = await (tokenContract as ERC677).estimateGas.transferAndCall(
        bridgeContract.address,
        amount.toString(),
        walletAddress,
      )
    } else {
      gasLimit = isDedicatedERC20
        ? await (bridgeContract as ForeignOmniMediator).estimateGas['relayTokens(address,uint256)'](
            walletAddress,
            amount.toString(),
          )
        : await (bridgeContract as ForeignOmniMediator).estimateGas[
            'relayTokens(address,address,uint256)'
          ](tokenAddress, walletAddress, amount.toString())
    }
  }

  return {
    gasLimit,
    tx: async function () {
      return isDedicatedERC20
        ? (bridgeContract as ForeignOmniMediator)['relayTokens(address,uint256)'](
            walletAddress,
            amount.toString(),
          )
        : isERC677
        ? (tokenContract as ERC677).transferAndCall(
            bridgeContract.address,
            amount.toString(),
            walletAddress,
          )
        : (bridgeContract as ForeignOmniMediator)['relayTokens(address,address,uint256)'](
            tokenAddress,
            walletAddress,
            amount.toString(),
          )
    },
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
 * @returns An object containing the gas limit and a transaction function.
 */
const handleERC20TokenFromHome = async ({
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

  const tokenContract = isERC677
    ? ERC677__factory.connect(tokenAddress, signer)
    : ERC20__factory.connect(tokenAddress, signer)

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
    return {
      gasLimit: await (tokenContract as ERC677).estimateGas.transferAndCall(
        bridgeContract.address,
        amount.toString(),
        bytesData,
      ),
      tx: async function () {
        return (tokenContract as ERC677).transferAndCall(
          bridgeContract.address,
          amount.toString(),
          bytesData,
        )
      },
    }
  }

  if (isDedicatedERC20) {
    return {
      gasLimit: await (bridgeContract as HomeOmniMediator).estimateGas[
        'relayTokens(address,uint256)'
      ](walletAddress, amount.toString()),
      tx: async function () {
        return (bridgeContract as HomeOmniMediator)['relayTokens(address,uint256)'](
          walletAddress,
          amount.toString(),
        )
      },
    }
  }

  // ERC20
  if (allowance && amount > allowance) {
    return {
      gasLimit: await tokenContract.estimateGas.approve(bridgeContract.address, amount.toString()),
      tx: async function () {
        return tokenContract.approve(bridgeContract.address, amount.toString())
      },
    }
  }

  return {
    gasLimit: await bridgeContract.estimateGas['relayTokens(address,address,uint256)'](
      tokenAddress,
      recipient || walletAddress,
      amount.toString(),
    ),
    tx: async function () {
      return bridgeContract['relayTokens(address,address,uint256)'](
        tokenAddress,
        recipient || walletAddress,
        amount.toString(),
      )
    },
  }
}

/**
 * Handles the transfer of ERC20 tokens from foreign chain.
 * @param bridgeContractAddress The bridge contract instance (ForeignOmniMediator).
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param isDAI Optional. Indicates if the token is DAI.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleUsdceFromHome = async ({
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
  const tokenContract = isERC677
    ? ERC677__factory.connect(tokenAddress, signer)
    : ERC20__factory.connect(tokenAddress, signer)

  let gasLimit: bigint

  const bytesData = defaultAbiCoder.encode(['address'], [walletAddress])

  if (!isERC677 && amount > allowance) {
    gasLimit = await tokenContract.estimateGas.approve(bridgeContract.address, amount.toString())
  } else {
    gasLimit = await bridgeContract.estimateGas.relayTokensAndCall(
      tokenAddress,
      TRANSMUTER_ADDRESS,
      amount.toString(),
      bytesData,
    )
  }

  return {
    gasLimit,
    tx: async function () {
      return bridgeContract.relayTokensAndCall(
        tokenAddress,
        TRANSMUTER_ADDRESS,
        amount.toString(),
        bytesData,
      )
    },
  }
}

/**
 * Handles the transfer of ERC20 tokens from foreign chain.
 * @param bridgeContractAddress The bridge contract instance (ForeignOmniMediator).
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param isDAI Optional. Indicates if the token is DAI.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleUsdcFromForeign = async ({
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
  const tokenContract = isERC677
    ? ERC677__factory.connect(tokenAddress, signer)
    : ERC20__factory.connect(tokenAddress, signer)

  let gasLimit: bigint

  const bytesData = defaultAbiCoder.encode(['address'], [walletAddress])

  if (!isERC677 && amount > allowance) {
    gasLimit = await tokenContract.estimateGas.approve(bridgeContract.address, amount.toString())
  } else {
    gasLimit = await bridgeContract.estimateGas.relayTokensAndCall(
      tokenAddress,
      TRANSMUTER_ADDRESS,
      amount.toString(),
      bytesData,
    )
  }

  return {
    gasLimit,
    tx: async function () {
      return bridgeContract.relayTokensAndCall(
        tokenAddress,
        TRANSMUTER_ADDRESS,
        amount.toString(),
        bytesData,
      )
    },
  }
}

/**
 * Handles the transfer of Dai and USDS tokens from foreign chain trough BridgeRouter
 * @param bridgeContractAddress The bridge contract instance (ForeignBridgeRouter).
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleUsdsOrDaiFromForeign = async ({
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
  const tokenContract = ERC20__factory.connect(tokenAddress, signer)
  let gasLimit: bigint
  const bridgeRouterContract = contracts.BridgeRouter.address[1]

  if (amount > allowance) {
    gasLimit = await tokenContract.estimateGas.approve(bridgeRouterContract, amount.toString())
  } else {
    gasLimit = await bridgeContract.estimateGas.relayTokens(
      tokenAddress,
      recipient ? recipient.toLowerCase() : userAddress.toLowerCase(),
      amount.toString(),
    )
  }

  return {
    gasLimit,
    tx: async function () {
      return bridgeContract.relayTokens(
        tokenAddress,
        recipient ? recipient.toLowerCase() : userAddress.toLowerCase(),
        amount.toString(),
        {
          gasLimit,
        },
      )
    },
  }
}

export const getBridgeTx = async ({
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
    return {
      gasLimit: ZERO_BN,
      gasPrice: ZERO_BN,
      tx: null,
    }
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

  const gasPrice = await bridgeContract.provider.getGasPrice()
  const { gasLimit, tx } =
    isUsdsEth || isDaiEth
      ? await handleUsdsOrDaiFromForeign({
          bridgeContractAddress,
          amount,
          tokenAddress,
          userAddress: account,
          recipient,
          allowance,
        })
      : isUsdceGnosis
      ? await handleUsdceFromHome({
          bridgeContractAddress,
          amount,
          tokenAddress,
          userAddress: account,
          recipient,
          allowance,
          tokenMode,
        })
      : isUsdcEth
      ? await handleUsdcFromForeign({
          bridgeContractAddress,
          amount,
          tokenAddress,
          allowance,
          tokenMode,
          recipient,
          userAddress: account,
        })
      : isNativeToken
      ? isFromHome
        ? await handleNativeTokenFromHome({
            bridgeContractAddress,
            amount,
            recipient,
            fromChainId,
            userAddress: account,
            toTokenAddress,
          })
        : await handleNativeTokenFromForeign({
            bridgeContractAddress,
            amount,
            walletAddress: recipient || account,
          })
      : isFromHome
      ? await handleERC20TokenFromHome({
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
      : await handleERC20TokenFromForeign({
          bridgeContractAddress,
          amount,
          tokenAddress,
          allowance,
          tokenMode,
          recipient,
          userAddress: account,
          isDAI: isNativeBridge, // use nativeBridge for DAI
        })

  return {
    gasLimit,
    gasPrice,
    tx,
  }
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
    allowanceAddress: getBridgeContract(fromChainId, toChainId, token.address).address,
    chainId: fromChainId,
    tokenAddress: token.address,
  })
  if (!userBalancesData) throw new Error('User balances are not available')

  const toTokenAddress = toToken ? toToken.address : undefined

  return useSWR(
    [
      'transactionInfo',
      token,
      fromChainId,
      toChainId,
      amount,
      recipient,
      tokenMode,
      receiveNativeToken,
      toTokenAddress,
    ],
    async ([
      ,
      _token,
      _fromChainId,
      _toChainId,
      _amount,
      _recipient,
      _tokenMode,
      _receiveNativeToken,
      _toTokenAddress,
    ]) => {
      const { gasLimit, gasPrice, tx } = await getBridgeTx({
        account: userAddress,
        amount: _amount,
        fromChainId: _fromChainId,
        toChainId: _toChainId,
        tokenAddress: _token.address,
        recipient: _recipient,
        tokenMode: _tokenMode,
        receiveNativeToken: _receiveNativeToken,
        allowance: userBalancesData.allowance,
        balance: userBalancesData.balance,
        toTokenAddress: _toTokenAddress,
      })

      return {
        gasLimit,
        gasPrice,
        tx,
      }
    },
  )
}
