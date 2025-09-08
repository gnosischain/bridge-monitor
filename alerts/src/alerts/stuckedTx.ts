import gql from 'graphql-tag'
import * as fs from 'fs'
import * as path from 'path'
import { useNativeGraphqlClient, useForeignGraphqlClient } from '../graphql'
import { Message, MessageType } from './messages'


const TRANSACTION_TIMEOUT_HOURS = parseInt(process.env.TRANSACTION_TIMEOUT_HOURS) || 2
const ALERT_STATE_FILE = process.env.ALERT_STATE_FILE || path.join(__dirname, '../../data/stuck-tx-alerts.json')
const ALERT_CLEANUP_HOURS = parseInt(process.env.ALERT_CLEANUP_HOURS) || 48 // Cleanup resolved alerts after 48 hours

const STUCK_TRANSACTIONS_QUERY = gql`
  query StuckTransactions($startupThreshold: BigInt!) {
    transactions(
      where: {
        and: [
          { timestamp_gte: $startupThreshold },
          { transactionStatus: COLLECTING }
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
// Store the stucked txs in /data folder to avoid duplicate signaling
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
      if(parsed){
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
  
  // Already alerted - update timestamp but don't alert again
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

const createStuckTransactionMessage = (tx: StuckTransaction): Message => {
  
    const now = Date.now()
  
      const hoursStuck = (now - parseInt(tx.timestamp)) / 3600
      const validationCount = tx.validations?.length || 0
      let body = `• \`${tx.transactionHash}\` (${formatDuration(hoursStuck)} stuck, ${validationCount} validations)\n`
      body += `  Bridge: ${tx.bridgeName} | ${tx.initiatorNetwork} → ${tx.receiverNetwork}\n`
      body += '\n'

      return {
        title: `🚨 Stuck Tx Alert on ${tx.bridgeName} for ${hoursStuck} hr(s)`,
        type: MessageType.STUCK_TRANSACTION,
        createdBy: tx.bridgeName,
        createdByLink: tx.initiatorNetwork === 'gnosis' ? `https://gnosisscan.io/tx/${tx.transactionHash}` : `https://etherscan.io/tx/${tx.transactionHash}`,
        timestamp: new Date(),
        body: body
      }
   
  
}

const checkStuckTransactions = async (): Promise<Message[]> => {
  console.log("Checking for Tx with COLLECTING status...")
  const messages: Message[] = []
  
  // Don't need to wait for required block confirmation because the STATUS will be 'INITIATED' instead of 'COLLECTING'
  const currentTime = Date.now()
  const timeThreshold = currentTime - TRANSACTION_TIMEOUT_HOURS * 3600
  
  try {
    // Load current alert state
    let alertState = loadAlertState()

    console.log(`📊 Loaded alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)
    
    // For first startup or when lastCheckedTimestamp is 0, check from timeNow - transactionTimeoutHours
    let startupThreshold: number
    if ( alertState.lastCheckedTimestamp === 0) {
      // First startup case: check from timeNow - transactionTimeoutHours to timeNow
      startupThreshold = timeThreshold
      console.log(`🚀 First startup: checking transactions from ${new Date(startupThreshold).toISOString()} to now`)
    } else {
      // Regular case: check from last checked timestamp
      startupThreshold = alertState.lastCheckedTimestamp
      console.log(`🔄 Regular check: monitoring transactions after ${new Date(startupThreshold).toISOString()}`)
    }
    
    console.log(`⏰ Looking for transactions stuck after: ${new Date(timeThreshold).toISOString()}`)
    
    const nativeClient = useNativeGraphqlClient()
    const foreignClient = useForeignGraphqlClient()
    
    const queryVariables = { 
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
      
      // Update timestamps for all stuck transactions (including duplicates)
      nativeResponse.transactions.forEach(tx => {
        recordAlert(tx, 'native', alertState)
      })
      
      // Only add messages for new transactions
      if (newTransactions.length > 0) {
        newTransactions.forEach(tx => {
          messages.push(createStuckTransactionMessage(tx))
        })
      }
    }
    
    // Process foreign bridge transactions
    if (foreignResponse.transactions.length > 0) {
      const newTransactions = foreignResponse.transactions.filter(tx => shouldAlertTransaction(tx, alertState))
      console.log(`🔍 Foreign bridge: ${foreignResponse.transactions.length} stuck, ${newTransactions.length} new alerts`)
      
      // Update timestamps for all stuck transactions (including duplicates)
      foreignResponse.transactions.forEach(tx => {
        recordAlert(tx, 'foreign', alertState)
      })
      
      // Only add messages for new transactions
      if (newTransactions.length > 0) {
        newTransactions.forEach(tx => {
          messages.push(createStuckTransactionMessage(tx))
        })
      }
    }
    
    // Update lastCheckedTimestamp to current time to prevent overlapping in next iteration
    alertState.lastCheckedTimestamp = currentTime
    
    // Save updated alert state
    saveAlertState(alertState)
    console.log(`💾 Saved alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)
    
  } catch (error) {
    console.error('Error checking stuck transactions:', error)
  }
  
  return messages
}

export { checkStuckTransactions }