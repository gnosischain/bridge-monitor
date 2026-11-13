import { useState } from 'react'

import { type Abi, type Address, type Hash, type Hex, parseAbi, parseEventLogs } from 'viem'
import { useReadContract } from 'wagmi'

import ForeignBridgeRouter_abi from '@/src/abis/ForeignBridgeRouter'
import { notify } from '@/src/components/toast'
import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { ToastStates } from '@/src/constants/types'
import useTransaction from '@/src/hooks/useTransaction'
import { ClaimActions } from '@/src/hooks/useTransactions'
import {
  TransactionRevertedError,
  type TxCall,
  getPublicClient,
  getTransactionReceipt,
  toCall,
  waitForMinedReceipt,
} from '@/src/lib/web3/transactions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Transaction } from '@/src/utils/transactions'

const ETHEREUM_BLOCK_TIME = 12_000

const relayedMessagesAbi = parseAbi(['function relayedMessages(bytes32) view returns (bool)'])

const isXDAI = (transaction: Transaction) => transaction.bridgeName.toUpperCase() === 'XDAI'

// The id the Ethereum bridge records the claim under: the AMB message id, or for the xDAI bridge the
// nonce of the signed message, which the indexer prefixes with Gnosis' chain id (0x00000064).
const getRelayId = (transaction: Transaction): Hex =>
  (isXDAI(transaction)
    ? transaction.id.startsWith('0x00000064')
      ? '0x00000000' + transaction.id.substring(10)
      : transaction.transactionHash
    : transaction.id) as Hex

const getClaimTx = async (
  transaction: Transaction,
): Promise<{ calls: TxCall[]; chainId: ChainsValues }> => {
  const routerAddress = contracts.BridgeRouter.address[Chains.mainnet] as Address
  const gnosisClient = getPublicClient(Chains.gnosis)

  if (isXDAI(transaction)) {
    // XDAI Bridge
    // recover message and signatures
    const modifiedId = getRelayId(transaction)

    const helperContract = {
      address: contracts.BridgeHelper.address[Chains.gnosis] as Address,
      abi: contracts.BridgeHelper.abi as Abi,
    }

    const messageHash = (await gnosisClient.readContract({
      ...helperContract,
      functionName: 'getMessageHash',
      args: [
        transaction.receiver as Address,
        BigInt(transaction.receiverAmount),
        modifiedId,
        transaction.receiverToken as Address,
      ],
    })) as Hex

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

/**
 * Claims a Gnosis Chain → Ethereum withdrawal on Ethereum: connects the wallet or switches it to
 * Ethereum first when needed, then sends the claim and records it through `claimActions`.
 */
export const useClaim = (transaction: Transaction, claimActions: ClaimActions) => {
  const { connectWallet, getExplorerUrl, isWalletConnected, pushNetwork, walletChainId } =
    useWeb3Connection()
  const [isWorking, setIsWorking] = useState(false)

  const sendTx = useTransaction()

  const claim = async (): Promise<void> => {
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

    let claimHash: Hash | null = null

    try {
      const claimTx = await getClaimTx(transaction)

      claimHash = await sendTx(claimTx)
      if (!claimHash) throw new Error('No receipt')

      // update tx to reflect claiming in progress
      claimActions.markAsClaiming(transaction)

      // Rejects with a TransactionRevertedError on a revert, so getting past it means the
      // withdrawal really is completed.
      const receipt = await waitForMinedReceipt(claimHash, Chains.mainnet)
      claimActions.markAsClaimed(transaction, {
        transactionHash: receipt.transactionHash,
        // The receipt carries no block timestamp, and the client clock is close enough for a value
        // the indexer overwrites on its next refetch.
        timestamp: Date.now(),
        executor: receipt.from,
      })
    } catch (e) {
      console.error('Claim failed', e)

      if (e instanceof TransactionRevertedError) {
        claimActions.clearClaim(transaction)
        notify({
          type: ToastStates.failed,
          explorerUrl: getExplorerUrl(e.receipt.transactionHash),
          message: 'Failed to claim - it might have already been claimed',
          id: 'claim',
        })
      } else if (claimHash) {
        // The claim is broadcast but its receipt never arrived: the poll gives up after 180s, and
        // an RPC failure rejects the same way.
        notify({
          title: 'Claim still pending',
          type: ToastStates.waiting,
          explorerUrl: getExplorerUrl(claimHash),
          message: 'Taking longer than usual to confirm, it will complete on its own.',
          id: 'claim',
        })
      } else {
        notify({
          type: ToastStates.failed,
          message: 'Failed to claim',
          id: 'claim',
        })
      }
    } finally {
      setIsWorking(false)
    }
  }

  return { claim, isWorking }
}

/**
 * Whether the withdrawal has been claimed on Ethereum, from any wallet or app. Read from the bridge
 * contract once per block until it is, since the indexer is only polled up to "ready to claim".
 * Pass null to skip the read.
 */
export const useIsClaimedOnChain = (transaction: Transaction | null) => {
  const { data } = useReadContract({
    address: (transaction && isXDAI(transaction) ? contracts.XDAIBridge : contracts.AMB).address[
      Chains.mainnet
    ],
    abi: relayedMessagesAbi,
    args: transaction ? [getRelayId(transaction)] : undefined,
    chainId: Chains.mainnet,
    functionName: 'relayedMessages',
    query: {
      enabled: !!transaction,
      refetchInterval: ({ state }) => (state.data ? false : ETHEREUM_BLOCK_TIME),
    },
  })

  return data === true
}
