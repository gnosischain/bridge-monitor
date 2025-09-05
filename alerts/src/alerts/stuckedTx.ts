import gql from 'graphql-tag'
import * as fs from 'fs'
import * as path from 'path'
import { useNativeGraphqlClient, useForeignGraphqlClient } from '../graphql'
import { Message, MessageType } from './messages'

const TRANSACTION_TIMEOUT_HOURS = parseInt(process.env.TRANSACTION_TIMEOUT_HOURS) || 2
const ALERT_STATE_FILE = process.env.ALERT_STATE_FILE || path.join(__dirname, '../../data/stuck-tx-alerts.json')
const ALERT_CLEANUP_HOURS = parseInt(process.env.ALERT_CLEANUP_HOURS) || 48 // Cleanup resolved alerts after 48 hours


const STUCK_TRANSACTIONS_QUERY = gql`
  query StuckTransactions($timeThreshold: BigInt!, $startupThreshold: BigInt!) {
    transactions(
      where: {
        and: [
          { timestamp_gte: $startupThreshold },
          {
            or: [
              { transactionStatus: COLLECTING, timestamp_lt: $timeThreshold }
            ]
          }
        ]
      }
      orderBy: timestamp
      orderDirection: asc
      first: 50
    ) {
      id
      transactionHash
      bridgeName
      transactionStatus
      timestamp
      initiator
      initiatorNetwork
      receiverNetwork
      initiatorToken
      receiverToken
      initiatorAmount
      validations {
        id
        timestamp
        validatorAddr
      }
      execution {
        id
        timestamp
        validatorAddr
      }
    }
  }
`

type StuckTransaction = {
  id: string
  transactionHash: string
  bridgeName: string
  transactionStatus: 'COLLECTING'
  timestamp: string
  initiator: string
  initiatorNetwork: string
  receiverNetwork: string
  initiatorToken: string
  receiverToken: string
  initiatorAmount: string
  validations: Array<{
    id: string
    timestamp: string
    validatorAddr: string
  }>
  execution: Array<{
    id: string
    timestamp: string
    validatorAddr: string
  }>
}

type StuckTransactionsResponse = {
  transactions: StuckTransaction[]
}

type StuckTransactionsVariables = {
  timeThreshold: string
  startupThreshold: string
}

type AlertState = {
  transactionId: string
  transactionHash: string
  status: 'COLLECTING'
  firstAlertTime: number
  lastAlertTime: number
  bridgeEndpoint: string
}

type AlertStateFile = {
  version: string
  alerts: Record<string, AlertState>
  lastCleanup: number
  lastCheckedTimestamp: number
}

// State management functions
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
      return parsed
    }
  } catch (error) {
    console.warn('Failed to load alert state file:', error)
  }
  
  return {
    version: '1.0',
    alerts: {},
    lastCleanup: Date.now(),
    lastCheckedTimestamp: Math.floor(Date.now() / 1000) - TRANSACTION_TIMEOUT_HOURS * 3600
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
  
  // Remove alerts for transactions that are no longer stuck or are old
  const cleanedAlerts: Record<string, AlertState> = {}
  
  Object.entries(state.alerts).forEach(([txId, alertState]) => {
    const isStillStuck = currentStuckTxIds.has(txId)
    const isRecent = alertState.lastAlertTime > cleanupThreshold
    
    if (isStillStuck || isRecent) {
      cleanedAlerts[txId] = alertState
    } else {
      console.log(`🗑️  Cleaning up resolved alert for transaction: ${alertState.transactionHash}`)
    }
  })
  
  return {
    ...state,
    alerts: cleanedAlerts,
    lastCleanup: now
  }
}

const shouldAlertTransaction = (tx: StuckTransaction, alertState: AlertStateFile): boolean => {
  const existingAlert = alertState.alerts[tx.id]
  
  if (!existingAlert) {
    // New transaction, should alert
    return true
  }
  
  // Already alerted - skip
  console.log(`⏭️  Skipping already alerted transaction: ${tx.transactionHash} (first alerted: ${new Date(existingAlert.firstAlertTime).toISOString()})`)
  return false
}

const recordAlert = (tx: StuckTransaction, endpoint: string, alertState: AlertStateFile): void => {
  const now = Date.now()
  const existingAlert = alertState.alerts[tx.id]
  
  alertState.alerts[tx.id] = {
    transactionId: tx.id,
    transactionHash: tx.transactionHash,
    status: tx.transactionStatus,
    firstAlertTime: existingAlert?.firstAlertTime || now,
    lastAlertTime: now,
    bridgeEndpoint: endpoint
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

const createStuckTransactionMessage = (transactions: StuckTransaction[], endpoint: string): Message => {
  const collectingTxs = transactions.filter(tx => tx.transactionStatus === 'COLLECTING')
  
  const now = Math.floor(Date.now() / 1000)
  
  let body = `Found ${transactions.length} stuck transaction${transactions.length !== 1 ? 's' : ''} on ${endpoint.includes('foreign') ? 'Foreign' : 'Native'} bridge:\n\n`
  
  if (collectingTxs.length > 0) {
    body += `**🔄 COLLECTING Status (${collectingTxs.length}) - Waiting for validator signatures:**\n`
    collectingTxs.forEach(tx => {
      const hoursStuck = (now - parseInt(tx.timestamp)) / 3600
      const validationCount = tx.validations?.length || 0
      body += `• \`${tx.transactionHash}\` (${formatDuration(hoursStuck)} stuck, ${validationCount} validations)\n`
      body += `  Bridge: ${tx.bridgeName} | ${tx.initiatorNetwork} → ${tx.receiverNetwork}\n`
    })
    body += '\n'
  }
  
 
  return {
    title: `🚨 ${transactions.length} Stuck Transaction${transactions.length !== 1 ? 's' : ''} Alert`,
    body,
    type: MessageType.STUCK_TRANSACTION,
    createdBy: 'Bridge Monitor',
    createdByLink: '',
    timestamp: new Date()
  }
}

const checkStuckTransactions = async (): Promise<Message[]> => {
  const messages: Message[] = []
  
  const currentTime = Math.floor(Date.now() / 1000)
  const timeThreshold = currentTime - TRANSACTION_TIMEOUT_HOURS * 3600
  
  try {
    // Load current alert state
    let alertState = loadAlertState()
    console.log(`📊 Loaded alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)
    
    // Use lastCheckedTimestamp to only look at transactions after the last check
    const startupThreshold = alertState.lastCheckedTimestamp
    console.log(`🕒 Monitoring transactions after: ${new Date(startupThreshold * 1000).toISOString()}`)
    console.log(`⏰ Looking for transactions stuck before: ${new Date(timeThreshold * 1000).toISOString()}`)
    
    const nativeClient = useNativeGraphqlClient()
    const foreignClient = useForeignGraphqlClient()
    
    const queryVariables = { 
      timeThreshold: timeThreshold.toString(),
      startupThreshold: startupThreshold.toString()
    }
    
    const [nativeResponse, foreignResponse] = await Promise.all([
      nativeClient<StuckTransactionsResponse, StuckTransactionsVariables>(STUCK_TRANSACTIONS_QUERY, queryVariables),
      foreignClient<StuckTransactionsResponse, StuckTransactionsVariables>(STUCK_TRANSACTIONS_QUERY, queryVariables)
    ])
    
    // Collect all current stuck transaction IDs for cleanup
    const currentStuckTxIds = new Set<string>()
    nativeResponse.transactions.forEach(tx => currentStuckTxIds.add(tx.id))
    foreignResponse.transactions.forEach(tx => currentStuckTxIds.add(tx.id))
    
    // Clean up resolved alerts periodically
    const shouldCleanup = Date.now() - alertState.lastCleanup > (60 * 60 * 1000) // Every hour
    if (shouldCleanup) {
      console.log('🧹 Performing periodic cleanup of resolved alerts...')
      alertState = cleanupResolvedAlerts(alertState, currentStuckTxIds)
    }
    
    // Process native bridge transactions
    if (nativeResponse.transactions.length > 0) {
      const newTransactions = nativeResponse.transactions.filter(tx => shouldAlertTransaction(tx, alertState))
      console.log(`🔍 Native bridge: ${nativeResponse.transactions.length} stuck, ${newTransactions.length} new alerts`)
      
      if (newTransactions.length > 0) {
        // Record alerts for new transactions
        newTransactions.forEach(tx => recordAlert(tx, 'native', alertState))
        messages.push(createStuckTransactionMessage(newTransactions, 'native'))
      }
    }
    
    // Process foreign bridge transactions
    if (foreignResponse.transactions.length > 0) {
      const newTransactions = foreignResponse.transactions.filter(tx => shouldAlertTransaction(tx, alertState))
      console.log(`🔍 Foreign bridge: ${foreignResponse.transactions.length} stuck, ${newTransactions.length} new alerts`)
      
      if (newTransactions.length > 0) {
        // Record alerts for new transactions
        newTransactions.forEach(tx => recordAlert(tx, 'foreign', alertState))
        messages.push(createStuckTransactionMessage(newTransactions, 'foreign'))
      }
    }
    
    // Update lastCheckedTimestamp to current timeThreshold
    alertState.lastCheckedTimestamp = timeThreshold
    
    // Save updated alert state
    saveAlertState(alertState)
    console.log(`💾 Saved alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)
    
  } catch (error) {
    console.error('Error checking stuck transactions:', error)
  }
  
  return messages
}

export { checkStuckTransactions }