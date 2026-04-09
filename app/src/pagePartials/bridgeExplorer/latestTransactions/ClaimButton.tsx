import { notify } from '@/src/components/toast'
import { chainsConfig, getNetworkConfig } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { Chains } from '@/src/constants/config/types'
import { ToastStates } from '@/src/constants/types'
import { useContractInstance } from '@/src/hooks/useContractInstance'
import useTransaction from '@/src/hooks/useTransaction'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Transaction } from '@/src/utils/transactions'
import {
  AMBBridgeHelper__factory,
  Erc20ToNativeBridgeHelper,
  Erc20ToNativeBridgeHelper__factory,
  Erc20ToNativeBridgeHelper_beforeUSDSMigration,
  Erc20ToNativeBridgeHelper_beforeUSDSMigration__factory,
  ForeignAMB,
  ForeignBridgeRouter,
  ForeignBridgeRouter__factory,
} from '@/types/typechain'
import { Interface } from '@ethersproject/abi'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { WalletState } from '@web3-onboard/core'
import { useState } from 'react'
import styled from 'styled-components'
import { UpdateInMemoryTx } from '@/src/hooks/useTransactions'
import { useIsUsdsEnabled } from '@/src/hooks/contracts/useIsUsdsEnabled'

const Wrapper = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.primary};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border: none;
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: 6px;
  cursor: pointer;
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  height: 28px;
  justify-content: center;
  line-height: 1.2rem;
  min-width: 90px;
  padding: 0;
  text-transform: uppercase;
  transition: none;
  width: fit-content;

  &:active {
    opacity: 0.6;
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

type ClaimButtonProps = {
  transaction: Transaction
  updateInMemoryTransaction: UpdateInMemoryTx
}

export const ClaimButton = ({
  transaction,
  updateInMemoryTransaction,
  ...restProps
}: ClaimButtonProps) => {
  const { appChainId, connectWallet, isWalletConnected, isWalletNetworkSupported, pushNetwork } =
    useWeb3Connection()
  const [isWorking, setIsWorking] = useState(false)
  const isUsdsEnabled = useIsUsdsEnabled()
  const erc20ToNativeBridgeHelper = useContractInstance(
    isUsdsEnabled
      ? Erc20ToNativeBridgeHelper__factory
      : Erc20ToNativeBridgeHelper_beforeUSDSMigration__factory,
    isUsdsEnabled ? 'BridgeHelper' : 'BridgeHelper__beforeUsdsMigration',
    Chains.gnosis,
  )

  const ambBridgeHelper = useContractInstance(
    AMBBridgeHelper__factory,
    'AMBBridgeHelper',
    Chains.gnosis,
  )

  const sendTx = useTransaction({ skipConnectionCheck: true })

  const isXDAI = transaction.bridgeName.toUpperCase() === 'XDAI'

  const getClaimTx = async (
    provider: Web3Provider,
  ): Promise<
    | (() => ReturnType<ForeignBridgeRouter['executeSignatures']>)
    | (() => ReturnType<ForeignAMB['safeExecuteSignaturesWithAutoGasLimit']>)
  > => {
    const address = contracts.BridgeRouter.address[Chains.mainnet]

    const foreignBridgeRouter = ForeignBridgeRouter__factory.connect(address, provider.getSigner())
    if (isXDAI) {
      // XDAI Bridge
      // recover message and signatures
      const modifiedId = transaction.id.startsWith('0x00000064')
        ? '0x00000000' + transaction.id.substring(10)
        : transaction.transactionHash

      const messageHash = await (isUsdsEnabled
        ? (erc20ToNativeBridgeHelper as Erc20ToNativeBridgeHelper)[
            'getMessageHash(address,uint256,bytes32,address)'
          ](transaction.receiver, transaction.receiverAmount, modifiedId, transaction.receiverToken)
        : (
            erc20ToNativeBridgeHelper as Erc20ToNativeBridgeHelper_beforeUSDSMigration
          ).getMessageHash(transaction.receiver, transaction.receiverAmount, modifiedId))
      const [message, signatures] = await Promise.all([
        erc20ToNativeBridgeHelper.getMessage(messageHash),
        erc20ToNativeBridgeHelper.getSignatures(messageHash),
      ])

      return () => foreignBridgeRouter.executeSignatures(message, signatures)
    } else {
      // AMB Bridge
      // recover message and signatures
      const gnosisProvider = new JsonRpcProvider(chainsConfig[Chains.gnosis].rpcUrl, Chains.gnosis)
      const initialTx = await gnosisProvider.getTransactionReceipt(transaction.transactionHash)
      const AMBInterface = new Interface(contracts.AMB.abi)
      const USER_REQUEST_FOR_SIGNATURE_TOPIC0 =
        '0x520d2afde79cbd5db58755ac9480f81bc658e5c517fcae7365a3d832590b0183'
      const userRequestForSignatureEvent =
        initialTx && initialTx.logs
          ? initialTx.logs.find((log) => log.topics[0] === USER_REQUEST_FOR_SIGNATURE_TOPIC0)
          : undefined

      if (!userRequestForSignatureEvent) {
        notify({
          type: ToastStates.failed,
          message: 'Failed to claim - unable to build claim tx',
          id: 'claim',
        })
        console.error(
          'Unable to build claim tx. Log for UserRequestForSignatures not found',
          initialTx,
        )
        setIsWorking(false)
        return () => {
          throw new Error('Unable to build claim tx. Log for UserRequestForSignatures not found')
        }
      }

      const message = AMBInterface.parseLog(userRequestForSignatureEvent).args.encodedData
      const signatures = await ambBridgeHelper.getSignatures(message)

      return () => foreignBridgeRouter.safeExecuteSignaturesWithAutoGasLimit(message, signatures)
    }
  }

  const executeClaim = async (): Promise<void> => {
    setIsWorking(true)

    // if not connected, show a modal to connect
    if (!isWalletConnected) {
      const walletStates = await connectWallet()

      if (!walletStates?.length) {
        notify({
          type: ToastStates.failed,
          message: 'Failed to connect wallet',
          id: 'connectWallet',
        })
        console.error('you need to connect your wallet in order to claim')
        setIsWorking(false)
        return
      }
    }

    const currentAppChain = getNetworkConfig(appChainId)

    // if not on the right network, show a modal to switch
    if (
      !isWalletNetworkSupported ||
      transaction.receiverNetwork !== currentAppChain.shortName.toLowerCase()
    ) {
      const networkSwitched = await pushNetwork({
        chainId: chainsConfig[Chains.mainnet].chainIdHex,
      })

      if (!networkSwitched) {
        notify({
          type: ToastStates.failed,
          message: 'Failed to switch network',
          id: 'switchNetwork',
        })
        console.error('you need to switch to the right network in order to claim')
        setIsWorking(false)
        return
      }
    }

    notify({
      title: 'Claiming',
      type: ToastStates.waiting,
      message: 'Gathering data',
      id: 'claim',
    })

    const wallet: WalletState = window.onboard.state.get().wallets[0]
    const provider = new Web3Provider(wallet.provider)
    const claim = await getClaimTx(provider)

    try {
      const receipt = await sendTx(claim)
      if (!receipt) throw new Error('No receipt')

      // update tx to reflect claiming in progress
      updateInMemoryTransaction(transaction)

      // once executed, if the page is still open, bring new state from the SG.
      await provider.waitForTransaction(receipt.hash)

      // give some time the SG to index
      setTimeout(() => {
        updateInMemoryTransaction()
        setIsWorking(false)
      }, 5000)
    } catch (e) {
      // If the method reverts, the withdrawal was likely already executed.
      // In this case, the user should be notified that the withdrawal was already executed.
      console.log('error', e)
      notify({
        type: ToastStates.failed,
        message: 'Failed to claim - it might have already been claimed',
        id: 'claim',
      })
      setIsWorking(false)
    }
  }

  const handleClaim = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    await executeClaim()
  }

  return (
    <Wrapper disabled={isWorking || transaction.isClaiming} onClick={handleClaim} {...restProps}>
      Claim
      {transaction.isClaiming && 'ing...'}
    </Wrapper>
  )
}
