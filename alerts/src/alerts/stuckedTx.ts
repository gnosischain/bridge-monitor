import gql from 'graphql-tag'
import { useNativeGraphqlClient, useForeignGraphqlClient } from '../graphql'
import { Message, MessageType } from './messages'

const TRANSACTION_TIMEOUT_HOURS = parseInt(process.env.TRANSACTION_TIMEOUT_HOURS) || 2

const STUCK_TRANSACTIONS_QUERY = gql`
  query StuckTransactions($timeThreshold: BigInt!) {
    transactions(
      where: {
        or: [
          { transactionStatus: COLLECTING, timestamp_lt: $timeThreshold }
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
  
  const timeThreshold = Math.floor(Date.now() / 1000 - TRANSACTION_TIMEOUT_HOURS * 3600)
  
  try {
    const nativeClient = useNativeGraphqlClient()
    const foreignClient = useForeignGraphqlClient()
    
    const [nativeResponse, foreignResponse] = await Promise.all([
      nativeClient<StuckTransactionsResponse, StuckTransactionsVariables>(STUCK_TRANSACTIONS_QUERY, { timeThreshold: timeThreshold.toString() }),
      foreignClient<StuckTransactionsResponse, StuckTransactionsVariables>(STUCK_TRANSACTIONS_QUERY, { timeThreshold: timeThreshold.toString() })
    ])
    
    if (nativeResponse.transactions.length > 0) {
      messages.push(createStuckTransactionMessage(nativeResponse.transactions, 'native'))
    }
    
    if (foreignResponse.transactions.length > 0) {
      messages.push(createStuckTransactionMessage(foreignResponse.transactions, 'foreign'))
    }
    
  } catch (error) {
    console.error('Error checking stuck transactions:', error)
  }
  
  return messages
}

export { checkStuckTransactions }