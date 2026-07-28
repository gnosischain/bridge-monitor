import { useState } from 'react'
import styled from 'styled-components'

import { type Abi, type Address, type Hash, type Hex, parseEventLogs } from 'viem'

import ForeignBridgeRouter_abi from '@/src/abis/ForeignBridgeRouter'
import { notify } from '@/src/components/toast'
import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { ToastStates } from '@/src/constants/types'
import { useIsUsdsEnabled } from '@/src/hooks/contracts/useIsUsdsEnabled'
import useTransaction from '@/src/hooks/useTransaction'
import { UpdateInMemoryTx } from '@/src/hooks/useTransactions'
import {
  type TxCall,
  getPublicClient,
  getTransactionReceipt,
  toCall,
  waitForMinedReceipt,
} from '@/src/lib/web3/transactions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Transaction } from '@/src/utils/transactions'

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
  const { connectWallet, isWalletConnected, pushNetwork, walletChainId } = useWeb3Connection()
  const [isWorking, setIsWorking] = useState(false)
  const isUsdsEnabled = useIsUsdsEnabled()

  const sendTx = useTransaction({ skipConnectionCheck: true })

  const isXDAI = transaction.bridgeName.toUpperCase() === 'XDAI'

  const getClaimTx = async (): Promise<{ calls: TxCall[]; chainId: ChainsValues }> => {
    const routerAddress = contracts.BridgeRouter.address[Chains.mainnet] as Address
    const gnosisClient = getPublicClient(Chains.gnosis)

    if (isXDAI) {
      // XDAI Bridge
      // recover message and signatures
      const modifiedId = (
        transaction.id.startsWith('0x00000064')
          ? '0x00000000' + transaction.id.substring(10)
          : transaction.transactionHash
      ) as Hex

      const helperContract = isUsdsEnabled
        ? {
            address: contracts.BridgeHelper.address[Chains.gnosis] as Address,
            abi: contracts.BridgeHelper.abi as Abi,
          }
        : {
            address: contracts.BridgeHelper__beforeUsdsMigration.address[Chains.gnosis] as Address,
            abi: contracts.BridgeHelper__beforeUsdsMigration.abi as Abi,
          }

      const messageHash = (await (isUsdsEnabled
        ? gnosisClient.readContract({
            ...helperContract,
            functionName: 'getMessageHash',
            args: [
              transaction.receiver as Address,
              BigInt(transaction.receiverAmount),
              modifiedId,
              transaction.receiverToken as Address,
            ],
          })
        : gnosisClient.readContract({
            ...helperContract,
            functionName: 'getMessageHash',
            args: [transaction.receiver as Address, BigInt(transaction.receiverAmount), modifiedId],
          }))) as Hex

      const [message, signatures] = (await Promise.all([
        gnosisClient.readContract({
          ...helperContract,
          functionName: 'getMessage',
          args: [messageHash],
        }),
        gnosisClient.readContract({
          ...helperContract,
          functionName: 'getSignatures',
          args: [messageHash],
        }),
      ])) as [Hex, Hex]

      return {
        calls: [
          toCall({
            abi: ForeignBridgeRouter_abi,
            address: routerAddress,
            functionName: 'executeSignatures',
            args: [message, signatures],
          }),
        ],
        chainId: Chains.mainnet,
      }
    } else {
      // AMB Bridge
      // recover message and signatures from the origin tx receipt on Gnosis
      const initialTx = await getTransactionReceipt(
        transaction.transactionHash as Hash,
        Chains.gnosis,
      ).catch(() => null)

      const [userRequestForSignatureEvent] = initialTx
        ? parseEventLogs({
            abi: contracts.AMB.abi,
            logs: initialTx.logs,
            eventName: 'UserRequestForSignature',
          })
        : []

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
        throw new Error('Unable to build claim tx. Log for UserRequestForSignatures not found')
      }

      const message = userRequestForSignatureEvent.args.encodedData
      const signatures = await gnosisClient.readContract({
        address: contracts.AMBBridgeHelper.address[Chains.gnosis],
        abi: contracts.AMBBridgeHelper.abi,
        functionName: 'getSignatures',
        args: [message],
      })

      return {
        calls: [
          toCall({
            abi: ForeignBridgeRouter_abi,
            address: routerAddress,
            functionName: 'safeExecuteSignaturesWithAutoGasLimit',
            args: [message, signatures],
          }),
        ],
        chainId: Chains.mainnet,
      }
    }
  }

  const executeClaim = async (): Promise<void> => {
    setIsWorking(true)

    // if not connected, open the wallet modal and let the user connect first
    if (!isWalletConnected) {
      connectWallet()
      setIsWorking(false)
      return
    }

    // Claims always execute on Ethereum. Only act when actually on another chain — compared by
    // chainId, not network-name strings (the tx's 'mainnet' vs the config's 'ethereum' never
    // matched, forcing a redundant switch even when already on Ethereum — which throws on a Safe).
    if (walletChainId !== Chains.mainnet) {
      // Attempt the switch. `pushNetwork` surfaces its own toast when the wallet can't switch
      // programmatically (e.g. the Safe web app) and stays silent on a deliberate user cancel, so
      // here we just abort the claim on failure.
      const networkSwitched = await pushNetwork(Chains.mainnet)

      if (!networkSwitched) {
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
      const claim = await getClaimTx()

      const receipt = await sendTx(claim)
      if (!receipt) throw new Error('No receipt')

      // update tx to reflect claiming in progress
      updateInMemoryTransaction(transaction)

      // once executed, if the page is still open, bring new state from the SG.
      await waitForMinedReceipt(receipt, Chains.mainnet)

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
