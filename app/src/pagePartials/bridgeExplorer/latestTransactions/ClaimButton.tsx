import { notify } from '@/src/components/toast'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { Chains } from '@/src/constants/config/types'
import { ToastStates } from '@/src/constants/types'
import {
  ambBridgeHelperContract,
  bridgeHelperBeforeUsdsMigrationContract,
  bridgeHelperContract,
  foreignBridgeRouterContract,
  homeAmbContract,
} from '@/src/constants/config/contracts'
import { useTransaction } from '@/src/hooks/useTransaction'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Transaction } from '@/src/utils/transactions'
import { useIsUsdsEnabled } from '@/src/hooks/contracts/useIsUsdsEnabled'
import { useState } from 'react'
import styled from 'styled-components'
import { decodeEventLog, encodeFunctionData } from 'viem'
import { usePublicClient } from 'wagmi'

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
  updateInMemoryTransaction: () => void
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
  const { execute } = useTransaction()

  const gnosisClient = usePublicClient({ chainId: Chains.gnosis })
  if (!gnosisClient) {
    throw new Error('Gnosis client not found')
  }

  const isXDAI = transaction.bridgeName.toUpperCase() === 'XDAI'

  const buildClaimTxData = async () => {
    const helperContract = isUsdsEnabled
      ? bridgeHelperContract
      : bridgeHelperBeforeUsdsMigrationContract

    if (isXDAI) {
      const modifiedId = transaction.id.startsWith('0x00000064')
        ? '0x00000000' + transaction.id.substring(10)
        : transaction.transactionHash

      const messageHashArgs = isUsdsEnabled
        ? ([
            transaction.receiver,
            transaction.receiverAmount,
            modifiedId,
            transaction.receiverToken,
          ] as const)
        : ([transaction.receiver, transaction.receiverAmount, modifiedId] as const)

      const messageHash = await gnosisClient!.readContract({
        ...helperContract,
        functionName: isUsdsEnabled
          ? 'getMessageHash(address,uint256,bytes32,address)'
          : 'getMessageHash',
        args: messageHashArgs,
      } as Parameters<typeof gnosisClient.readContract>[0])

      const [message, signatures] = await Promise.all([
        gnosisClient!.readContract({
          ...helperContract,
          functionName: 'getMessage',
          args: [messageHash as `0x${string}`],
        } as Parameters<typeof gnosisClient.readContract>[0]),
        gnosisClient!.readContract({
          ...helperContract,
          functionName: 'getSignatures',
          args: [messageHash as `0x${string}`],
        } as Parameters<typeof gnosisClient.readContract>[0]),
      ])

      return {
        to: foreignBridgeRouterContract.address,
        data: encodeFunctionData({
          abi: foreignBridgeRouterContract.abi,
          functionName: 'executeSignatures',
          args: [message as `0x${string}`, signatures as `0x${string}`],
        }),
        title: 'Claim',
      }
    } else {
      // AMB Bridge
      const receipt = await gnosisClient!.getTransactionReceipt({
        hash: transaction.transactionHash as `0x${string}`,
      })

      const USER_REQUEST_FOR_SIGNATURE_TOPIC0 =
        '0x520d2afde79cbd5db58755ac9480f81bc658e5c517fcae7365a3d832590b0183'

      const log = receipt?.logs.find((l) => l.topics[0] === USER_REQUEST_FOR_SIGNATURE_TOPIC0)

      if (!log) {
        notify({
          type: ToastStates.failed,
          message: 'Failed to claim - unable to build claim tx',
          id: 'claim',
        })
        console.error(
          'Unable to build claim tx. Log for UserRequestForSignatures not found',
          receipt,
        )
        throw new Error('Unable to build claim tx. Log for UserRequestForSignatures not found')
      }

      const { args } = decodeEventLog({
        abi: homeAmbContract.abi,
        eventName: 'UserRequestForSignature',
        data: log.data,
        topics: log.topics,
      })

      const message = (args as { encodedData: `0x${string}` }).encodedData

      const signatures = await gnosisClient!.readContract({
        ...ambBridgeHelperContract,
        functionName: 'getSignatures',
        args: [message],
      } as Parameters<typeof gnosisClient.readContract>[0])

      return {
        to: foreignBridgeRouterContract.address,
        data: encodeFunctionData({
          abi: foreignBridgeRouterContract.abi,
          functionName: 'safeExecuteSignaturesWithAutoGasLimit',
          args: [message, signatures as `0x${string}`],
        }),
        title: 'Claim',
      }
    }
  }

  const executeClaim = async (): Promise<void> => {
    setIsWorking(true)

    if (!isWalletConnected) {
      connectWallet()
      notify({
        type: ToastStates.failed,
        message: 'Please connect your wallet to claim',
        id: 'connectWallet',
      })
      setIsWorking(false)
      return
    }

    const currentAppChain = getNetworkConfig(appChainId)

    if (
      !isWalletNetworkSupported ||
      transaction.receiverNetwork !== currentAppChain.shortName.toLowerCase()
    ) {
      const networkSwitched = await pushNetwork(Chains.mainnet)

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

    try {
      const txData = await buildClaimTxData()
      await execute([txData])
      updateInMemoryTransaction()
    } catch (e) {
      console.log('error', e)
      notify({
        type: ToastStates.failed,
        message: 'Failed to claim - it might have already been claimed',
        id: 'claim',
      })
    } finally {
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
