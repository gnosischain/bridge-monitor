import { BigNumber, Signer } from 'ethers'
import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { ZERO_BN } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
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
import { TOKEN_MODE } from '@/src/hooks/bridge/useTokenMode'

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
  isDAI?: boolean,
  recipient?: string,
) => {
  if (isDAI) {
    const tokenContract = ERC20__factory.connect(tokenAddress, signer)

    const gasLimit = recipient
      ? await (bridgeContract as ForeignBridgeErcToNative).estimateGas.relayTokens(
          recipient,
          amount,
        )
      : await tokenContract.estimateGas.transfer(bridgeContract.address, amount)

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
  } else {
    const signerAddress = await signer.getAddress()
    // Never use transfer in this case. Always use relayTokens.
    // Can we use transferAndCall here if the token is compatible with ERC677/ERC827???
    const gasLimit = await (bridgeContract as ForeignOmniMediator).estimateGas[
      'relayTokens(address,address,uint256)'
    ](tokenAddress, recipient || signer.getAddress(), amount)

    return {
      gasLimit,
      tx: async function () {
        return (bridgeContract as ForeignOmniMediator)['relayTokens(address,address,uint256)'](
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
  recipient?: string,
  receiveNativeToken?: boolean,
  isERC677?: boolean,
) => {
  // Here we have two cases. If the token is compatible with ERC677/ERC827 we should use transferAndCall method and avoid the approve step.
  const tokenContract = isERC677
    ? ERC677__factory.connect(tokenAddress, signer)
    : ERC20__factory.connect(tokenAddress, signer)

  const signerAddress = await signer.getAddress()
  console.log(foreignChainId)

  // byteData info in: https://docs.tokenbridge.net/eth-xdai-amb-bridge/multi-token-extension/transfer-weth-from-xdai-to-eth-on-mainnet
  const bytesData = receiveNativeToken
    ? `${contracts.nativeOmniBridge.address[foreignChainId]}${(recipient || signerAddress).replace(
        '0x',
        '',
      )}`
    : recipient || signerAddress

  const gasLimit = isERC677
    ? await (tokenContract as ERC677).estimateGas.transferAndCall(
        bridgeContract.address,
        amount,
        bytesData,
      )
    : recipient
    ? await bridgeContract.estimateGas['relayTokens(address,address,uint256)'](
        recipient,
        tokenAddress,
        amount,
      )
    : await tokenContract.estimateGas.transfer(bridgeContract.address, amount)

  return {
    gasLimit,
    tx: async function () {
      return isERC677
        ? (tokenContract as ERC677).transferAndCall(bridgeContract.address, amount, bytesData, {
            gasLimit,
          })
        : recipient
        ? bridgeContract['relayTokens(address,address,uint256)'](recipient, tokenAddress, amount, {
            gasLimit,
          })
        : tokenContract.transfer(bridgeContract.address, amount, {
            gasLimit,
          })
    },
  }
}

export const getBridgeTx = async ({
  account,
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
  bridgeContract:
    | HomeBridgeErcToNative
    | ForeignBridgeErcToNative
    | NativeOmniBridgeMediator
    | HomeOmniMediator
    | ForeignOmniMediator
  tokenAddress: string
  isNativeToken: boolean
  isNativeBridge: boolean
  isFromHome: boolean
  foreignChainId: ChainsValues
  tokenMode?: TOKEN_MODE
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
        recipient,
        receiveNativeToken,
        tokenMode === 'ERC677', // isERC677
      )
    : await handleERC20TokenFromForeign(
        bridgeContract as ForeignOmniMediator,
        signer,
        amount,
        tokenAddress,
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
  foreignChainId,
  isFromHome,
  isNativeBridge,
  isNativeToken,
  isValid,
  receiveNativeToken,
  recipient,
  shouldApprove,
  token,
  tokenMode,
}: {
  amount: BigNumber
  isFromHome: boolean
  isNativeBridge: boolean
  isNativeToken: boolean
  foreignChainId: ChainsValues
  isValid: boolean
  shouldApprove: boolean
  tokenMode?: TOKEN_MODE
  receiveNativeToken?: boolean
  recipient?: string
  token?: Token
}) => {
  const { address } = useWeb3Connection()
  const { getFromBridgeWithSigner } = useBridgeContracts(foreignChainId)

  const shouldFetch = token && amount.gt(0) && isValid && !shouldApprove && tokenMode

  return useSWR(
    shouldFetch
      ? [
          token,
          amount,
          recipient,
          isNativeToken,
          isNativeBridge,
          isFromHome,
          tokenMode,
          receiveNativeToken,
          foreignChainId,
          'transactionInfo',
        ]
      : null,

    async ([
      _token,
      _amount,
      _recipient,
      _isNativeToken,
      _isNativeBridge,
      _isFromHome,
      _tokenMode,
      _receiveNativeToken,
      _foreignChainId,
    ]) => {
      const bridgeContractWithSigner = getFromBridgeWithSigner(
        _isFromHome,
        _isNativeBridge,
        _isNativeToken,
      )

      if (!address) {
        throw Error('No account found')
      }

      try {
        const { gasLimit, gasPrice, tx } = await getBridgeTx({
          isNativeToken,
          account: address,
          amount: _amount,
          isNativeBridge: isNativeBridge,
          bridgeContract: bridgeContractWithSigner,
          tokenAddress: _token.address,
          recipient: _recipient,
          tokenMode: _tokenMode,
          isFromHome: _isFromHome,
          foreignChainId: _foreignChainId,
          receiveNativeToken: _receiveNativeToken,
        })

        return {
          gasLimit,
          gasPrice,
          tx,
        }
      } catch (error) {
        console.error(error)

        return {
          gasLimit: ZERO_BN,
          gasPrice: ZERO_BN,
          tx: null,
        }
      }
    },
    { suspense: false },
  )
}
