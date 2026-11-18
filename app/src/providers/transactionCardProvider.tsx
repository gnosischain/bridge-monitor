import { ReactNode, createContext, useContext, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import {
  type Address,
  BaseError,
  ContractFunctionRevertedError,
  type Hash,
  InvalidParamsRpcError,
  UserRejectedRequestError,
  WaitForCallsStatusTimeoutError,
  formatTransactionRequest,
  isHash,
  numberToHex,
} from 'viem'
import { ConnectorChainMismatchError, useSendCalls } from 'wagmi'
import { getConnectorClient, waitForCallsStatus } from 'wagmi/actions'

import { Modal } from '@/src/components/modal'
import { type Status } from '@/src/components/transactionCard/IconStatus'
import { StatusDetails } from '@/src/components/transactionCard/StatusDetails'
import { StepButton } from '@/src/components/transactionCard/StepButton'
import { chainsConfig } from '@/src/constants/config/chains'
import { ChainsValues } from '@/src/constants/config/types'
import {
  TransactionRevertedError,
  type TxCall,
  getPublicClient,
  waitForTransactionReceipt,
} from '@/src/lib/web3/transactions'
import { useTransactionNotification } from '@/src/providers/transactionNotificationProvider'
import { wagmiConfig } from '@/src/providers/wagmi'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export type TxRequest = {
  title: string
  chainId: ChainsValues
  calls: TxCall[]
  // where to find the result once a wallet that queues it (a multisig) executes it
  queuedHint: string
  // gets the last call's hash once it is sent, after the card closes
  onDone: (hash: Hash) => void
}

type StepState = 'idle' | 'checking' | 'signing' | 'confirming' | 'done' | 'failed' | 'queued'

const icons: Record<StepState, Status> = {
  idle: 'none',
  checking: 'waiting',
  signing: 'waiting',
  confirming: 'pending',
  done: 'success',
  failed: 'warning',
  queued: 'warning',
}

const QUEUED_MESSAGE = "Not executed after 60s. Don't submit it again."
const NO_HASH_MESSAGE =
  "Your wallet didn't return a transaction hash. Don't submit it again: track it from your wallet instead."

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 3)
    calc(var(--theme-common-space) * 3);
`

const errorMessage = (e: unknown, chainName: string) => {
  // wagmi's own error, not a viem BaseError
  if (e instanceof ConnectorChainMismatchError) {
    return `Switch your wallet to ${chainName} and try again.`
  }
  if (!(e instanceof BaseError)) return e instanceof Error ? e.message : 'Something went wrong.'
  if (e.walk((x) => x instanceof UserRejectedRequestError)) return 'Rejected in your wallet.'
  // how a wallet on another chain refuses the `chainId` we send (MetaMask)
  if (e.walk((x) => x instanceof InvalidParamsRpcError)) {
    return `Your wallet refused it. Make sure it is on ${chainName} and try again.`
  }
  return e.shortMessage
}

/**
 * Simulates the calls in order, each on the state the previous ones leave (`eth_simulateV1`), and
 * returns the first one that would revert. A node that can't simulate lets the stack through: the
 * wallet still simulates before signing.
 */
const findRevert = async (chainId: ChainsValues, account: Address, calls: TxCall[]) => {
  try {
    const { results } = await getPublicClient(chainId).simulateCalls({
      account,
      calls: calls.map(({ data, to, value }) => ({ data, to, value })),
    })
    const index = results.findIndex(({ status }) => status === 'failure')
    if (index === -1) return null
    const { error } = results[index]
    const reverted =
      error instanceof BaseError
        ? (error.walk(
            (x) => x instanceof ContractFunctionRevertedError,
          ) as ContractFunctionRevertedError | null)
        : null
    return { index, reason: reverted?.reason }
  } catch (e) {
    console.error(e)
    return null
  }
}

const TransactionCardContext = createContext<((request: TxRequest) => void) | undefined>(undefined)

/**
 * Sends a stack of calls from a card above the page: one `wallet_sendCalls` when the wallet batches
 * (EIP-5792), otherwise one transaction per call, each mined before the next. The card lives here,
 * not in the button that opens it, because that button re-renders on the allowance and balances
 * these transactions change.
 */
export const TransactionCardProvider = ({ children }: { children: ReactNode }) => {
  const { address, canBatch } = useWeb3Connection()
  const { mutateAsync: sendCallsAsync } = useSendCalls()
  const { notifyTxMined, notifyWaitingForTxMined } = useTransactionNotification()
  const queryClient = useQueryClient()
  const [request, setRequest] = useState<TxRequest | null>(null)
  const [states, setStates] = useState<StepState[]>([])
  const [message, setMessage] = useState('')
  // cleared on close, so a running stack stops after its pending wallet request
  const sending = useRef<TxRequest | null>(null)

  const close = () => {
    sending.current = null
    setRequest(null)
  }

  const run = async (req: TxRequest, from: number) => {
    const { calls, chainId, onDone, queuedHint } = req
    const isLive = () => sending.current === req
    const mark = (start: number, end: number, state: StepState) => {
      if (isLive()) setStates((s) => s.map((x, i) => (i >= start && i < end ? state : x)))
    }
    // the explorer-link toasts every transaction gets
    const track = (hash: Hash) => {
      notifyWaitingForTxMined(hash, chainId)
      const receipt = waitForTransactionReceipt(hash, chainId)
      receipt.then(
        (r) => {
          notifyTxMined(hash, chainId, r.status === 'success')
          // fresh balances and allowances for the page behind the card
          queryClient.invalidateQueries({ queryKey: ['readContract'] })
        },
        () => notifyTxMined(hash, chainId),
      )
      return receipt
    }
    const finish = (hash: Hash) => {
      if (!isLive()) return
      close()
      onDone(hash)
    }
    // sent but not trackable here: no Retry, it would send it twice
    const stop = (start: number, text: string) => {
      mark(start, calls.length, 'queued')
      if (isLive()) setMessage(text)
    }

    let step = from
    setMessage('')
    try {
      // a revert shows here, before any wallet opens, rather than as a wallet warning
      mark(from, from + 1, 'checking')
      const revert = address ? await findRevert(chainId, address, calls.slice(from)) : null
      if (revert) {
        const { label = 'A step' } = calls[from + revert.index]
        mark(from, from + 1, 'failed')
        if (isLive()) {
          setMessage(`Not sent: ${label} would fail${revert.reason ? ` (${revert.reason})` : ''}.`)
        }
        return
      }
      if (!isLive()) return
      // throws when the wallet reports another chain. Over WalletConnect the dapp side answers, so
      // the `chainId` sent with each transaction below is what lets the wallet itself refuse
      const client = await getConnectorClient(wagmiConfig, { chainId })

      if (canBatch) {
        // one signature, executed all-or-nothing
        mark(from, calls.length, 'signing')
        const { id } = await sendCallsAsync({
          calls: calls.slice(from).map(({ data, to, value }) => ({ data, to, value })),
          chainId,
          forceAtomic: calls.length - from > 1,
        })
        mark(from, calls.length, 'confirming')
        // a multisig can take hours, so past 60s the card says so instead
        const { receipts, status } = await waitForCallsStatus(wagmiConfig, { id, timeout: 60_000 })
        if (status !== 'success') throw new Error('The transaction failed in your wallet.')
        const hash = receipts?.at(-1)?.transactionHash
        if (!hash || !isHash(hash)) return stop(from, NO_HASH_MESSAGE)
        track(hash)
        return finish(hash)
      }

      for (; step < calls.length; step++) {
        if (!isLive()) return
        mark(step, step + 1, 'signing')
        const { data, to, value } = calls[step]
        // viem's sendTransaction drops `chainId` from this request (#514)
        const hash = await client.request({
          method: 'eth_sendTransaction',
          params: [
            {
              ...formatTransactionRequest({ account: client.account, data, to, value }),
              chainId: numberToHex(chainId),
            },
          ],
        })
        if (!isHash(hash)) return stop(step, NO_HASH_MESSAGE)
        const receipt = track(hash)
        if (step === calls.length - 1) return finish(hash)
        // the next call needs this one mined, like a bridge needs its approve
        mark(step, step + 1, 'confirming')
        const mined = await receipt
        if (mined.status !== 'success') throw new TransactionRevertedError(mined)
        mark(step, step + 1, 'done')
      }
    } catch (e) {
      console.error(e)
      if (e instanceof WaitForCallsStatusTimeoutError) {
        return stop(from, `${QUEUED_MESSAGE} ${queuedHint}`)
      }
      mark(step, canBatch ? calls.length : step + 1, 'failed')
      if (isLive()) setMessage(errorMessage(e, chainsConfig[chainId].name))
    }
  }

  const send = (req: TxRequest) => {
    sending.current = req
    setRequest(req)
    setStates(req.calls.map(() => 'idle'))
    run(req, 0)
  }

  const describe = ({ chainId }: TxRequest, state: StepState, remaining: number) => {
    if (state === 'checking') {
      return remaining > 1 ? 'Checking the transactions' : 'Checking the transaction'
    }
    if (state === 'signing') {
      return canBatch && remaining > 1
        ? 'Confirm in your wallet, one signature for all steps'
        : 'Confirm in your wallet'
    }
    if (state === 'confirming') {
      return canBatch
        ? 'Waiting for your wallet to execute it'
        : `Confirming on ${chainsConfig[chainId].name}`
    }
    return state === 'failed' || state === 'queued' ? message : ''
  }

  const active = states.findIndex((state) => state !== 'done')

  return (
    <TransactionCardContext.Provider value={send}>
      {children}
      {request && (
        <Modal onClose={close} title={request.title}>
          <Steps>
            {request.calls.map(({ label = '' }, i) => (
              <StatusDetails
                description={
                  i === active ? describe(request, states[i], request.calls.length - i) : ''
                }
                key={i}
                statusIcon={icons[states[i]]}
                title={label}
                transactionStatus={`Step ${i + 1} of ${request.calls.length}`}
              >
                {i === active && states[i] === 'failed' && (
                  <StepButton onClick={() => run(request, i)}>Retry</StepButton>
                )}
              </StatusDetails>
            ))}
          </Steps>
        </Modal>
      )}
    </TransactionCardContext.Provider>
  )
}

export function useTransactionCard() {
  const context = useContext(TransactionCardContext)
  if (context === undefined) {
    throw new Error('useTransactionCard must be used within a TransactionCardProvider')
  }
  return context
}
