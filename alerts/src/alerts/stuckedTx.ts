import gql from 'graphql-tag'
import * as fs from 'fs'
import * as path from 'path'
import { useNativeGraphqlClient, useForeignGraphqlClient } from '../graphql'
import { Message, MessageType } from './messages'

// Two scenarios:
// 1. Foreign -> Native 
// Foreign subgraph: record transaction timestamp and transactionStatus as INITIATED
// Native subgraph: use the id from Foreign subgraph to query and will have transactionStatus as COLLECTING / COMPLETED
// tx is stuck if: Native subgraph's status is still COLLECTING after timeout
// 2. Native -> Foreign 
// Native subgraph: record transaction timestamp, check for transaction that is INITIATED/COLLECTING/UNCLAIMED
// Foreign subgraph: use id from GC subgraph to query and will have transactionStatus as COMPLETED
// tx is stuck if: Native subgraph's status is still INITIATED/COLLECTING after timeout


const TRANSACTION_TIMEOUT_HOURS = parseInt(process.env.TRANSACTION_TIMEOUT_HOURS) || 2
const ALERT_STATE_FILE = process.env.ALERT_STATE_FILE || path.join(__dirname, '../../data/stuck-tx-alerts.json')
const ALERT_CLEANUP_HOURS = parseInt(process.env.ALERT_CLEANUP_HOURS) || 48 // Cleanup resolved alerts after 48 hours

// Query to get all transactions in time range
const TRANSACTIONS_QUERY = gql`
  query Transactions($maxDelay: BigInt!, $minDelay: BigInt!) {
    transactions(
      where: {
        and: [
          { timestamp_not: null }, 
          { timestamp_gte: $maxDelay },
          { timestamp_lt: $minDelay}
        ]
      }
      orderBy: timestamp
      orderDirection: asc
      first: 200
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

// Query to check if a specific transaction exists and its status
const TRANSACTION_BY_ID_QUERY = gql`
  query TransactionById($id: ID!) {
    transaction(id: $id) {
      id
      transactionStatus
      execution {
        id
        timestamp
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

type Transaction = {
  id: string
  transactionHash: string
  bridgeName: string
  transactionStatus: string
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

type TransactionsResponse = {
  transactions: Transaction[]
}

type TransactionsVariables = {
  maxDelay: string
  minDelay: string
}

type TransactionByIdResponse = {
  transaction: {
    id: string
    transactionStatus: string
    execution: Array<{
      id: string
      timestamp: string
    }>
  } | null
}

type TransactionByIdVariables = {
  id: string
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
  const cleanupThreshold = now - (ALERT_CLEANUP_HOURS * 60 * 60 * 1000) // in ms
  
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
  
    // tx.timestamp is in second 
    // Date.now is in ms
      const hoursStuck = (now - parseInt(tx.timestamp) * 1000) / (3600 * 1000) 
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
  console.log("Checking for stuck transactions across both subgraphs...")
  const messages: Message[] = []
  
  // Check period for [maxDelay, minDelay] // minDelay has to gte required block confirmation 
  let minDelay = Date.now() - TRANSACTION_TIMEOUT_HOURS * 3600 * 1000 // in ms
  let maxDelay = minDelay -  24 * 3600 * 1000   // default: 24 hours period from minDelay, in ms

  
  try {
    // Load current alert state
    let alertState = loadAlertState()

    console.log(`📊 Loaded alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)
    
    // For first startup or when lastCheckedTimestamp is 0, check from timeNow - transactionTimeoutHours
    if (alertState.lastCheckedTimestamp === 0) {
      console.log(`🚀 First startup: checking transactions from ${new Date(maxDelay).toISOString()} to ${new Date(minDelay).toISOString()}`)
    } else {
      // Regular case: check from last checked timestamp
      maxDelay = alertState.lastCheckedTimestamp
      console.log(`🔄 Regular check: monitoring transactions from ${new Date(maxDelay).toISOString()} to ${new Date(minDelay).toISOString()}`)
    }
        
    const nativeClient = useNativeGraphqlClient()
    const foreignClient = useForeignGraphqlClient()
    
    const queryVariables = { 
      maxDelay: Math.floor(maxDelay / 1000).toString(), // Convert to seconds for subgraph
      minDelay: Math.floor(minDelay / 1000).toString()  // Convert to seconds for subgraph
    }
    console.log("query variables ", queryVariables)
    
    // Get all transactions in the time period from both subgraphs
    const [nativeResponse, foreignResponse] = await Promise.all([
      nativeClient<TransactionsResponse, TransactionsVariables>(TRANSACTIONS_QUERY, queryVariables),
      foreignClient<TransactionsResponse, TransactionsVariables>(TRANSACTIONS_QUERY, queryVariables)
    ])
    
    console.log(`📊 Native transactions found: ${nativeResponse.transactions.length}`)
    console.log(`📊 Foreign transactions found: ${foreignResponse.transactions.length}`)
    
    const stuckTransactions: StuckTransaction[] = []
    const currentStuckTxIds = new Set<string>()

    // Scenario 1: Foreign -> Native (Foreign has INITIATED, Native should have COLLECTING/COMPLETED)
    for (const foreignTx of foreignResponse.transactions) {
      if (foreignTx.transactionStatus === 'INITIATED') {
        // Check if this transaction exists in native subgraph
        try {
          const nativeStatus = await nativeClient<TransactionByIdResponse, TransactionByIdVariables>(
            TRANSACTION_BY_ID_QUERY, 
            { id: foreignTx.id }
          )
          
          if (nativeStatus.transaction) {
            // Transaction exists in native - check if it's stuck in COLLECTING
            if (nativeStatus.transaction.transactionStatus === 'COLLECTING' && 
                !nativeStatus.transaction.execution.length ) {
              const stuckTx: StuckTransaction = {
                ...foreignTx,
                transactionStatus: 'COLLECTING'
              }
              stuckTransactions.push(stuckTx)
              currentStuckTxIds.add(foreignTx.id)
            }
          } else if(nativeStatus.transaction.transactionStatus === 'COMPLETED'){
            // skip
          }
         
          
        } catch (error) {
          console.warn(`Failed to check native status for transaction ${foreignTx.id}:`, error)
        }
      }
    }

    // Scenario 2: Native -> Foreign (Check if Native transactions are stuck in INITIATED/COLLECTING)
    for (const nativeTx of nativeResponse.transactions) {
      if (nativeTx.transactionStatus === 'INITIATED' || nativeTx.transactionStatus === 'COLLECTING') {
        // Check if transaction timestamp is older than timeout threshold
        const now = Date.now()
        const txAge = now - parseInt(nativeTx.timestamp) * 1000 // in ms
        const stuckThreshold = TRANSACTION_TIMEOUT_HOURS * 3600 * 1000 // in ms
        
        if (txAge > stuckThreshold) {
          // Transaction is stuck - older than timeout and still in INITIATED/COLLECTING
          const stuckTx: StuckTransaction = {
            ...nativeTx,
            transactionStatus: 'COLLECTING'
          }
          stuckTransactions.push(stuckTx)
          currentStuckTxIds.add(nativeTx.id)
        }
      }
    }

    console.log(`🔍 Found ${stuckTransactions.length} stuck transactions`)
    
    // Clean up resolved alerts periodically
    const shouldCleanup = Date.now() - alertState.lastCleanup > (60 * 60 * 1000) // Every hour
    if (shouldCleanup) {
      console.log('🧹 Performing periodic cleanup of resolved alerts...')
      alertState = cleanupResolvedAlerts(alertState, currentStuckTxIds)
    }
    
    // Process stuck transactions
    if (stuckTransactions.length > 0) {
      const newTransactions = stuckTransactions.filter(tx => shouldAlertTransaction(tx, alertState))
      console.log(`🚨 ${stuckTransactions.length} stuck transactions, ${newTransactions.length} new alerts`)
      
      // Update timestamps for all stuck transactions
      stuckTransactions.forEach(tx => {
        const endpoint = tx.initiatorNetwork === 'gnosis' ? 'native' : 'foreign'
        recordAlert(tx, endpoint, alertState)
      })
      
      // Only add messages for new transactions
      if (newTransactions.length > 0) {
        newTransactions.forEach(tx => {
          messages.push(createStuckTransactionMessage(tx))
        })
      }
    }
    
    // Update lastCheckedTimestamp to minDelay (end of current check period)
    alertState.lastCheckedTimestamp = minDelay
    
    // Save updated alert state
    saveAlertState(alertState)
    console.log(`💾 Saved alert state: ${Object.keys(alertState.alerts).length} tracked alerts`)
    
  } catch (error) {
    console.error('Error checking stuck transactions:', error)
  }
  
  return messages
}

export { checkStuckTransactions }