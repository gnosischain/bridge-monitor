import { BigNumber, Contract, ContractTransaction, Signer } from 'ethers'
import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { ZERO_BN } from '@/src/constants/misc'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import {
  ERC20__factory,
  ERC677,
  ERC677__factory,
  ForeignBridgeErcToNative,
  ForeignOmniMediator,
  HomeBridgeErcToNative,
  HomeOmniMediator,
  NativeOmniBridgeMediator,
} from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { TOKEN_MODE, useTokenMode } from '@/src/hooks/bridge/useTokenMode'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'

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
 * @param bridgeContract - NativeOmniBridgeMediator (Native Omni Bridge)
 * @param signer - The signer object used for signing transactions.
 * @param amount - The amount of tokens to be wrapped and relayed.
 * @param recipient - (Optional) The recipient address on the home chain. If not provided, the signer's address will be used.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleNativeTokenFromForeign = async (
  bridgeContract: NativeOmniBridgeMediator,
  signer: Signer,
  amount: BigNumber,
  recipient?: string,
) => {
  const gasLimit = await bridgeContract.estimateGas['wrapAndRelayTokens(address)'](
    recipient || signer.getAddress(),
    {
      value: amount,
    },
  )

  return {
    gasLimit,
    tx: async function () {
      return bridgeContract['wrapAndRelayTokens(address)'](recipient || signer.getAddress(), {
        value: amount,
        gasLimit,
      })
    },
  }
}

/**
 * Handles the transfer of native tokens from the home bridge contract.
 *
 * @param bridgeContract - The HomeBridgeErcToNative contract instance (xDAI Bridge).
 * @param signer - The signer object used for signing transactions.
 * @param amount - The amount of tokens to transfer.
 * @param recipient - Optional recipient address for the transfer.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleNativeTokenFromHome = async (
  bridgeContract: HomeBridgeErcToNative,
  signer: Signer,
  amount: BigNumber,
  recipient?: string,
) => {
  const gasLimit = recipient
    ? await bridgeContract.estimateGas.relayTokens(recipient, {
        value: amount,
      })
    : await signer.estimateGas({ to: bridgeContract.address, value: amount })

  return {
    gasLimit,
    tx: async function () {
      return recipient
        ? bridgeContract.relayTokens(recipient, {
            value: amount,
            gasLimit,
          })
        : signer.sendTransaction({
            to: bridgeContract.address,
            value: amount,
            gasLimit,
          })
    },
  }
}

/**
 * Handles the transfer of ERC20 tokens from foreign chain.
 * If the token is DAI, the transfer will be made using the xDAI bridge.
 * @param bridgeContract The bridge contract instance (ForeignOmniMediator or ForeignBridgeErcToNative).
 * @param signer The signer instance.
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the ERC20 token.
 * @param isDAI Optional. Indicates if the token is DAI.
 * @param recipient Optional. The recipient address.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleERC20TokenFromForeign = async (
  bridgeContract: ForeignOmniMediator | ForeignBridgeErcToNative,
  signer: Signer,
  amount: BigNumber,
  tokenAddress: string,
  allowance: BigNumber,
  tokenMode: TOKEN_MODE,
  isDAI?: boolean,
  recipient?: string,
) => {
  // Quick fix to avoid useBridgeValidations to error when an approval is needed.
  // If an approval is needed the gasLimit should be calculated for the approval operation and not for the bridge operation.
  // If that not happens the estimateGas will fail because the allowance is not enough.
  //
  // TODO: If an approval is needed, "gasLimit" will be set with the value the approval operation will take.
  // But "tx" will have the bridge operation. It would be good to solve this inconsistency.
  // And then remove the useApproval hook and call the approve using the tx function returned by this function.

  const isDedicatedERC20 = tokenMode === 'D-ERC20'
  const isERC677 = tokenMode === 'ERC677'
  const tokenContract = isERC677
    ? ERC677__factory.connect(tokenAddress, signer)
    : ERC20__factory.connect(tokenAddress, signer)

  let gasLimit: BigNumber
  if (isDAI) {
    if (amount.gt(allowance)) {
      gasLimit = await tokenContract.estimateGas.approve(bridgeContract.address, amount)
    } else {
      gasLimit = recipient
        ? await (bridgeContract as ForeignBridgeErcToNative).estimateGas.relayTokens(
            recipient.toLowerCase(),
            amount,
          )
        : await tokenContract.estimateGas.transfer(bridgeContract.address, amount)
    }

    return {
      gasLimit,
      tx: async function () {
        return recipient
          ? (bridgeContract as ForeignBridgeErcToNative).relayTokens(recipient, amount, {
              gasLimit,
            })
          : tokenContract.transfer(bridgeContract.address, amount, {
              gasLimit,
            })
      },
    }
  }

  const signerAddress = await signer.getAddress()

  if (!isERC677 && amount.gt(allowance)) {
    gasLimit = await tokenContract.estimateGas.approve(bridgeContract.address, amount)
  } else {
    // Never use transfer in this case. Always use relayTokens.
    // Can we use transferAndCall here if the token is compatible with ERC677/ERC827???
    // For Dedicated ERC20 (D-ERC20), we need to use relayTokens(address,address) method instead of relayTokens(address,address,uint256)
    if (isERC677) {
      gasLimit = await (tokenContract as ERC677).estimateGas.transferAndCall(
        bridgeContract.address,
        amount,
        recipient || signerAddress,
      )
    } else {
      gasLimit = isDedicatedERC20
        ? await (bridgeContract as ForeignOmniMediator).estimateGas['relayTokens(address,uint256)'](
            recipient || signerAddress,
            amount,
          )
        : await (bridgeContract as ForeignOmniMediator).estimateGas[
            'relayTokens(address,address,uint256)'
          ](tokenAddress, recipient || signer.getAddress(), amount)
    }
  }

  return {
    gasLimit,
    tx: async function () {
      return isDedicatedERC20
        ? (bridgeContract as ForeignOmniMediator)['relayTokens(address,uint256)'](
            recipient || signerAddress,
            amount,
            {
              gasLimit,
            },
          )
        : isERC677
        ? (tokenContract as ERC677).transferAndCall(
            bridgeContract.address,
            amount,
            recipient || signerAddress,
            {
              gasLimit,
            },
          )
        : (bridgeContract as ForeignOmniMediator)['relayTokens(address,address,uint256)'](
            tokenAddress,
            recipient || signerAddress,
            amount,
            {
              gasLimit,
            },
          )
    },
  }
}

/**
 * Handles the transfer of ERC20 tokens from home.
 * If the token is compatible with ERC677/ERC827, it uses the transferAndCall method and avoids the approve step.
 * @param bridgeContract The HomeOmniMediator contract instance.
 * @param signer The signer object used for signing transactions.
 * @param amount The amount of tokens to transfer.
 * @param tokenAddress The address of the token contract.
 * @param recipient Optional. The address of the recipient. If not provided, the tokens will be transferred to the bridge contract.
 * @param isERC677 Optional. Specifies whether the token is ERC677 compatible. Defaults to false.
 * @returns An object containing the gas limit and a transaction function.
 */
const handleERC20TokenFromHome = async (
  bridgeContract: HomeOmniMediator,
  signer: Signer,
  amount: BigNumber,
  tokenAddress: string,
  foreignChainId: ChainsValues,
  tokenMode: TOKEN_MODE,
  recipient?: string,
  receiveNativeToken?: boolean,
) => {
  // Here we have two cases. If the token is compatible with ERC677/ERC827 we should use transferAndCall method and avoid the approve step.
  const isERC677 = tokenMode === 'ERC677'
  const isDedicatedERC20 = tokenMode === 'D-ERC20'

  const tokenContract = isERC677
    ? ERC677__factory.connect(tokenAddress, signer)
    : ERC20__factory.connect(tokenAddress, signer)

  const receiver = recipient || (await signer.getAddress())

  // byteData info in: https://docs.tokenbridge.net/eth-xdai-amb-bridge/multi-token-extension/transfer-weth-from-xdai-to-eth-on-mainnet
  const bytesData = receiveNativeToken
    ? `${contracts.omniBridgeNativeToken.address[foreignChainId]}${receiver.replace('0x', '')}`
    : receiver

  // ERC20 => tokenAddress.approve(mediator, amount) => mediator.relayTokens(received, amount)
  // ERC677 =>  tokenAddress.transferAndCall(mediator)
  // dedicatedErc20 => mediator.relayTokens(received, amount)

  let gasLimit: BigNumber
  let tx: () => Promise<ContractTransaction>
  if (isERC677) {
    gasLimit = await (tokenContract as ERC677).estimateGas.transferAndCall(
      bridgeContract.address,
      amount,
      bytesData,
    )
    tx = async function () {
      return (tokenContract as ERC677).transferAndCall(bridgeContract.address, amount, bytesData, {
        gasLimit,
      })
    }
  } else if (isDedicatedERC20) {
    gasLimit = await (bridgeContract as HomeOmniMediator).estimateGas[
      'relayTokens(address,uint256)'
    ](receiver, amount)
    tx = async function () {
      return (bridgeContract as HomeOmniMediator)['relayTokens(address,uint256)'](
        receiver,
        amount,
        {
          gasLimit,
        },
      )
    }
  } else {
    gasLimit = recipient
      ? await bridgeContract.estimateGas['relayTokens(address,address,uint256)'](
          tokenAddress,
          receiver,
          amount,
        )
      : await tokenContract.estimateGas.transfer(bridgeContract.address, amount)
    tx = async function () {
      return recipient
        ? bridgeContract['relayTokens(address,address,uint256)'](tokenAddress, receiver, amount, {
            gasLimit,
          })
        : tokenContract.transfer(bridgeContract.address, amount, {
            gasLimit,
          })
    }
  }

  return {
    gasLimit,
    tx,
  }
}

export const getBridgeTx = async ({
  account,
  allowance,
  amount,
  bridgeContract,
  foreignChainId,
  isFromHome,
  isNativeBridge,
  isNativeToken,
  receiveNativeToken,
  recipient,
  tokenAddress,
  tokenMode,
}: {
  account: string
  amount: BigNumber
  allowance: BigNumber
  bridgeContract: Contract
  tokenAddress: string
  isNativeToken: boolean
  isNativeBridge: boolean
  isFromHome: boolean
  foreignChainId: ChainsValues
  tokenMode: TOKEN_MODE
  receiveNativeToken?: boolean
  recipient?: string
}) => {
  const signer = bridgeContract.signer

  if (amount.lte(0) || !account) {
    return {
      gasLimit: ZERO_BN,
      gasPrice: ZERO_BN,
      tx: null,
    }
  }

  const gasPrice = await signer.getGasPrice()

  const { gasLimit, tx } = isNativeToken
    ? isFromHome
      ? await handleNativeTokenFromHome(
          bridgeContract as HomeBridgeErcToNative,
          signer,
          amount,
          recipient,
        )
      : await handleNativeTokenFromForeign(
          bridgeContract as NativeOmniBridgeMediator,
          signer,
          amount,
          recipient,
        )
    : isFromHome
    ? await handleERC20TokenFromHome(
        bridgeContract as HomeOmniMediator,
        signer,
        amount,
        tokenAddress,
        foreignChainId,
        tokenMode,
        recipient,
        receiveNativeToken,
      )
    : await handleERC20TokenFromForeign(
        bridgeContract as ForeignOmniMediator,
        signer,
        amount,
        tokenAddress,
        allowance,
        tokenMode,
        isNativeBridge, // use nativeBridge for DAI
        recipient,
      )

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
  token,
  userAddress,
}: {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: BigNumber
  receiveNativeToken: boolean
  recipient?: string
  token: Token
}) => {
  const { getFromBridgeWithSigner } = useBridgeContracts()
  const { foreignChainId, isFromHome, isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress: token?.address || '',
  })
  const { data: tokenMode } = useTokenMode(fromChainId, toChainId, token)
  const { data: userBalancesData } = useUserTokenBalances({
    userAddress: userAddress,
    allowanceAddress: getFromBridgeWithSigner(fromChainId, toChainId, token?.address || '').address,
    chainId: fromChainId,
    tokenAddress: token.address,
  })
  if (!userBalancesData) throw new Error('User balances are not available')

  return useSWR(
    [
      'transactionInfo',
      token,
      amount,
      recipient,
      isFromHome,
      tokenMode,
      receiveNativeToken,
      foreignChainId,
    ],
    async ([
      ,
      _token,
      _amount,
      _recipient,
      _isFromHome,
      _tokenMode,
      _receiveNativeToken,
      _foreignChainId,
    ]) => {
      const bridgeContractWithSigner = getFromBridgeWithSigner(
        fromChainId,
        toChainId,
        token?.address || '',
      )

      if (!userAddress) {
        throw Error('No account found')
      }

      const { gasLimit, gasPrice, tx } = await getBridgeTx({
        isNativeToken,
        account: userAddress,
        amount: _amount,
        isNativeBridge: isNativeBridge,
        bridgeContract: bridgeContractWithSigner,
        tokenAddress: _token.address,
        recipient: _recipient,
        tokenMode: _tokenMode,
        isFromHome: _isFromHome,
        foreignChainId: _foreignChainId,
        receiveNativeToken: _receiveNativeToken,
        allowance: userBalancesData.allowance,
      })

      return {
        gasLimit,
        gasPrice,
        tx,
      }
    },
  )
}
