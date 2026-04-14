import gql from 'graphql-tag'
import * as fs from 'fs'
import * as path from 'path'
import { useGraphqlClient } from '../graphql'
import { Message, MessageType } from './messages'

// With Envio indexer, all transaction data (both chains) is in a single unified endpoint.
// A transaction is considered stuck if it remains in INITIATED or COLLECTING status
// after the timeout period.

const TRANSACTION_TIMEOUT_HOURS = parseInt(process.env.TRANSACTION_TIMEOUT_HOURS) || 2
const ALERT_STATE_FILE = process.env.ALERT_STATE_FILE || path.join(__dirname, '../../data/stuck-tx-alerts.json')
const ALERT_CLEANUP_HOURS = parseInt(process.env.ALERT_CLEANUP_HOURS) || 48 // Cleanup resolved alerts after 48 hours

// Query to get all non-completed transactions in time range
const TRANSACTIONS_QUERY = gql`
  query EnvioTransactions($where: Transaction_bool_exp, $order_by: [Transaction_order_by!], $limit: Int, $offset: Int) {
    Transaction(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
      id
      messageId
      bridgeType
      transactionHash
      timestamp
      initiatorNetwork
      initiator
      initiatorToken
      initiatorAmount
      receiverNetwork
      receiver
      receiverToken
      receiverAmount
      transactionStatus
      execution {
        id
        transactionHash
        timestamp
        executorAddress
      }
      validations {
        id
        transactionHash
        timestamp
        validatorAddress
      }
    }
  }
`

type Transaction = {
  id: string
  messageId: string
  transactionHash: string
  bridgeType: string
  transactionStatus: string
  timestamp: string
  initiator: string
  initiatorNetwork: number
  receiverNetwork: number
  initiatorToken: string
  receiverToken: string
  initiatorAmount: string
  receiverAmount: string
  validations: Array<{
    id: string
    timestamp: string
    validatorAddress: string
  }>
  execution: {
    id: string
    transactionHash: string
    timestamp: string
    executorAddress: string
  } | null
}

type TransactionsResponse = {
  Transaction: Transaction[]
}

type TransactionsVariables = {
  where: {
    _and: Array<Record<string, unknown>>
  }
  order_by: Array<{ timestamp: string }>
  limit: number
}

type AlertState = {
  transactionId: string
  transactionHash: string
  status: string
  firstAlertTime: number
  lastAlertTime: number
}

type AlertStateFile = {
  version: string
  alerts: Record<string, AlertState>
  lastCleanup: number
  lastCheckedTimestamp: number
}

// State management functions
// Store the stuck txs in /data folder to avoid duplicate signaling
const ensureDataDirectory = () => {
  const dataDir = path.dirname(ALERT_STATE_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

const loadAlertState = (): AlertStateFile => {
  try {
    ensureDataDirectory()
    if (fs.existsSync(ALERT_STATE_FILE)) {
      const data = fs.readFileSync(ALERT_STATE_FILE, 'utf-8')
      const parsed = JSON.parse(data) as AlertStateFile
      if (parsed) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Failed to load alert state file:', error)
  }

  return {
    version: "1.0",
    alerts: {},
    lastCleanup: Date.now(),
    lastCheckedTimestamp: 0
  }
}

const saveAlertState = (state: AlertStateFile): void => {
  try {
    ensureDataDirectory()
    fs.writeFileSync(ALERT_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save alert state file:', error)
  }
}

const cleanupResolvedAlerts = (state: AlertStateFile, currentStuckTxIds: Set<string>): AlertStateFile => {
  const now = Date.now()
  const cleanupThreshold = now - (ALERT_CLEANUP_HOURS * 60 * 60 * 1000)

  const cleanedAlerts: Record<string, AlertState> = {}

  Object.entries(state.alerts).forEach(([txId, alertState]) => {
    const isStillStuck = currentStuckTxIds.has(txId)
    const isRecent = alertState.lastAlertTime > cleanupThreshold

    if (isStillStuck || isRecent) {
      cleanedAlerts[txId] = alertState
    } else {
      console.log(`Cleaning up resolved alert for transaction: ${alertState.transactionHash}`)
    }
  })

  return {
    ...state,
    alerts: cleanedAlerts,
    lastCleanup: now
  }
}

const shouldAlertTransaction = (tx: Transaction, alertState: AlertStateFile): boolean => {
  const existingAlert = alertState.alerts[tx.id]

  if (!existingAlert) {
    return true
  }

  console.log(`Skipping already alerted transaction: ${tx.transactionHash} (first alerted: ${new Date(existingAlert.firstAlertTime).toISOString()})`)
  return false
}

const recordAlert = (tx: Transaction, alertState: AlertStateFile): void => {
  const now = Date.now()
  const existingAlert = alertState.alerts[tx.id]

  alertState.alerts[tx.id] = {
    transactionId: tx.id,
    transactionHash: tx.transactionHash,
    status: tx.transactionStatus,
    firstAlertTime: existingAlert?.firstAlertTime || now,
    lastAlertTime: now,
  }
}

const getNetworkName = (networkId: number | string): string => {
  const id = typeof networkId === 'string' ? parseInt(networkId) : networkId
  switch (id) {
    case 1: return 'Ethereum'
    case 100: return 'Gnosis'
    default: return `Chain ${id}`
  }
}

const getScanUrl = (networkId: number | string, txHash: string): string => {
  const id = typeof networkId === 'string' ? parseInt(networkId) : networkId
  switch (id) {
    case 1: return `https://etherscan.io/tx/${txHash}`
    case 100: return `https://gnosisscan.io/tx/${txHash}`
    default: return txHash
  }
}

const formatDuration = (hours: number): string => {
  if (hours < 24) {
    return `${Math.round(hours)} hour${hours !== 1 ? 's' : ''}`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
}

const createStuckTransactionMessage = (tx: Transaction): Message => {
  const now = Date.now()
  const hoursStuck = (now - parseInt(tx.timestamp) * 1000) / (3600 * 1000)
  const validationCount = tx.validations?.length || 0
  const networkFrom = getNetworkName(tx.initiatorNetwork)
  const networkTo = getNetworkName(tx.receiverNetwork)

  let body = `• \`${tx.transactionHash}\` (${formatDuration(hoursStuck)} stuck, ${validationCount} validations)\n`
  body += `  Bridge: ${tx.bridgeType} | ${networkFrom} -> ${networkTo}\n`
  body += '\n'

  return {
    title: `Stuck Tx Alert on ${tx.bridgeType} for ${formatDuration(hoursStuck)}`,
    type: MessageType.STUCK_TRANSACTION,
    createdBy: tx.bridgeType,
    createdByLink: getScanUrl(tx.initiatorNetwork, tx.transactionHash),
    timestamp: new Date(),
    body: body
  }
}

const checkStuckTransactions = async (): Promise<Message[]> => {
  console.log("Checking for stuck transactions via Envio indexer...")
  const messages: Message[] = []

  // Check period for [maxDelay, minDelay]
  let minDelay = Date.now() - TRANSACTION_TIMEOUT_HOURS * 3600 * 1000
  let maxDelay = minDelay - 24 * 3600 * 1000 // default: 24 hours period from minDelay

  try {
    let alertState = loadAlertState()
    console.log(`Loaded alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)

    if (alertState.lastCheckedTimestamp === 0) {
      console.log(`First startup: checking transactions from ${new Date(maxDelay).toISOString()} to ${new Date(minDelay).toISOString()}`)
    } else {
      maxDelay = alertState.lastCheckedTimestamp
      console.log(`Regular check: monitoring transactions from ${new Date(maxDelay).toISOString()} to ${new Date(minDelay).toISOString()}`)
    }

    const client = useGraphqlClient()

    const queryVariables: TransactionsVariables = {
      where: {
        _and: [
          { timestamp: { _is_null: false } },
          { timestamp: { _gte: Math.floor(maxDelay / 1000).toString() } },
          { timestamp: { _lt: Math.floor(minDelay / 1000).toString() } },
          { transactionStatus: { _in: ['INITIATED', 'COLLECTING'] } }
        ]
      },
      order_by: [{ timestamp: "asc" }],
      limit: 200
    }

    const response = await client<TransactionsResponse, TransactionsVariables>(TRANSACTIONS_QUERY, queryVariables)
    const stuckTransactions = response.Transaction
    console.log(`Found ${stuckTransactions.length} stuck transactions`)

    const currentStuckTxIds = new Set<string>(stuckTransactions.map(tx => tx.id))

    // Clean up resolved alerts periodically
    const shouldCleanup = Date.now() - alertState.lastCleanup > (60 * 60 * 1000)
    if (shouldCleanup) {
      console.log('Performing periodic cleanup of resolved alerts...')
      alertState = cleanupResolvedAlerts(alertState, currentStuckTxIds)
    }

    if (stuckTransactions.length > 0) {
      const newTransactions = stuckTransactions.filter(tx => shouldAlertTransaction(tx, alertState))
      console.log(`${stuckTransactions.length} stuck transactions, ${newTransactions.length} new alerts`)

      stuckTransactions.forEach(tx => {
        recordAlert(tx, alertState)
      })

      if (newTransactions.length > 0) {
        newTransactions.forEach(tx => {
          messages.push(createStuckTransactionMessage(tx))
        })
      }
    }

    alertState.lastCheckedTimestamp = minDelay
    saveAlertState(alertState)
    console.log(`Saved alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)

  } catch (error) {
    console.error('Error checking stuck transactions:', error)
  }

  return messages
}

export { checkStuckTransactions }
