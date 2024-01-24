import { BigNumber } from 'ethers'
import { ChainsValues } from '@/src/constants/config/types'
import useSWR from 'swr'
import { Token } from '@/types/token'
import { ZERO_ADDRESS, ZERO_BN } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import {
  ERC20__factory,
  ForeignBridgeErcToNative,
  ForeignOmniMediator,
  HomeBridgeErcToNative,
  HomeOmniMediator,
  NativeOmniBridgeMediator,
} from '@/types/typechain'

/**
 * Retrieves the necessary information for a bridge transaction. This includes the transaction function, gas price, and gas limit.
 * @param amount - The amount to be transferred.
 * @param bridgeContract - The bridge contract to be used for the transaction.
 * @param isFromHome - Indicates whether the transaction is from the home network.
 * @param isNativeBridge - Indicates whether the bridge is a native bridge.
 * @param recipient - The recipient of the transaction.
 * @param signer - The signer for the transaction.
 * @param tokenAddress - The address of the token to be transferred.
 * @returns An object containing the transaction function, gas price, and gas limit.
 */

/**
 * isNativeToken && isFromForeign: use wrapAndRelayTokens
 * isNativeToken && isFromHome && recipient: use relayTokens
 * isNativeToken && isFromHome && !recipient: use sendTransaction (from signer)
 * !isNativeToken && isFromForeign: use relayTokens
 * !isNativeToken && isFromHome && recipient: use relayTokens
 * !isNativeToken && isFromHome && !recipient: use transfer (or transferAndCall if is ERC677/ERC827 compatible) (from token contract)
 *
 * @returns
 */
export const getBridgeTx = async ({
  account,
  amount,
  bridgeContract,
  isFromHome,
  isNativeBridge,
  isNativeToken,
  recipient,
  tokenAddress,
}: {
  account: string
  amount: BigNumber
  bridgeContract:
    | HomeBridgeErcToNative
    | HomeOmniMediator
    | ForeignBridgeErcToNative
    | ForeignOmniMediator
    | NativeOmniBridgeMediator
  tokenAddress: string
  isNativeBridge: boolean
  isNativeToken: boolean
  isFromHome: boolean
  recipient?: string
}) => {
  let gasPrice = ZERO_BN
  let gasLimit = ZERO_BN
  let tx = null
  const signer = bridgeContract.signer

  if (amount.lte(0) || !account) {
    return {
      tx,
      gasPrice,
      gasLimit,
    }
  }

  // ---------------
  // xDaiBridge tx
  // ---------------
  if (isNativeBridge) {
    // Gnosis > foreign
    if (isFromHome) {
      const homeBridgeContract = bridgeContract as HomeBridgeErcToNative // Type assertion

      try {
        gasPrice = await signer.getGasPrice()
        gasLimit = recipient
          ? await homeBridgeContract.estimateGas.relayTokens(recipient, { value: amount })
          : await signer.estimateGas({ to: bridgeContract.address, value: amount })
      } catch (error) {
        console.error(error)
        throw Error('There is an error with your values. Please check and try again.')
      }

      tx = async function () {
        try {
          if (recipient) {
            return await homeBridgeContract.relayTokens(recipient, {
              gasPrice,
              gasLimit,
              value: amount,
            })
          } else {
            return await signer.sendTransaction({
              to: bridgeContract.address,
              value: amount,
              gasPrice,
              gasLimit,
            })
          }
        } catch (error) {
          console.error('Error on transaction:', error)
          throw error
        }
      }
      // Foreign > Gnosis
    } else {
      const foreignBridgeContract = bridgeContract as ForeignBridgeErcToNative // Type assertion

      const tokenContract = ERC20__factory.connect(tokenAddress, signer)

      try {
        gasPrice = await signer.getGasPrice()
        gasLimit = recipient
          ? await foreignBridgeContract.estimateGas.relayTokens(recipient, amount)
          : await tokenContract.estimateGas.transfer(bridgeContract.address, amount)
      } catch (error) {
        console.error(error)
        throw Error('There is an error with your values. Please check and try again.')
      }

      tx = function () {
        return recipient
          ? foreignBridgeContract.relayTokens(recipient, amount, {
              gasPrice,
              gasLimit,
            })
          : tokenContract.transfer(bridgeContract.address, amount, {
              gasPrice,
              gasLimit,
            })
      }
    }
  }

  // ---------------
  // OmniBridge tx @TODO
  // ---------------
  else {
    // @TODO - Add OmniBridge tx
  }

  return {
    tx,
    gasPrice,
    gasLimit,
  }
}

export const useBridgeTransactionInfo = ({
  amount,
  foreignChainId,
  isFromHome,
  isNativeBridge,
  isNativeToken,
  isValid,
  recipient,
  shouldApprove,
  token,
}: {
  amount: BigNumber
  isFromHome: boolean
  isNativeBridge: boolean
  isNativeToken: boolean
  foreignChainId: ChainsValues
  isValid: boolean
  shouldApprove: boolean
  recipient?: string
  token?: Token
}) => {
  const { address } = useWeb3Connection()
  const { getFromBridgeWithSigner } = useBridgeContracts(foreignChainId)

  const shouldFetch = token && amount.gt(0) && isValid && !shouldApprove

  return useSWR(
    shouldFetch
      ? [token, amount, recipient, isNativeToken, isNativeBridge, isFromHome, 'transactionInfo']
      : null,

    async ([_token, _amount, _recipient, _isNativeToken, _isNativeBridge, _isFromHome]) => {
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
          isFromHome,
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
