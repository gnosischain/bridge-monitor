import { BridgeContract, getBridgeContracts } from "../xdai"
import { Message, MessageType } from "./messages"

// @todo add logic to disable alert

// @todo define better thresholds for each bridge
const MIN_DAILY_LIMIT_THRESHOLD = 90
const MIN_EXECUTION_DAILY_LIMIT_THRESHOLD = 90

const createTitle = (bridgeContract: BridgeContract, type: string) => `Bridge Contract ${bridgeContract.name} is near to hit a ${type}`

const createBody = (bridgeContract: BridgeContract, leftAmount: number, totalAmount: number) => `The Bridge Contract ${bridgeContract.name} from ${bridgeContract.bridge} has used *${leftAmount}%* of *${totalAmount}* total`

const createLimitMessage = (bridgeContract: BridgeContract, type: string, leftAmount: number, totalAmount: number) => {
  return {
    title: createTitle(bridgeContract, type),
    type,
    createdBy: bridgeContract.name,
    createdByLink: bridgeContract.scanURL,
    timestamp: new Date(),
    body: createBody(bridgeContract, leftAmount, totalAmount),
  }
}

const createExecutionDailyLimitMessage = (bridgeContract: BridgeContract): Message => {
  const type = MessageType.EXECUTION_DAILY_LIMIT
  const totalAmount = bridgeContract.executionDailyLimit
  const usedAmountPercentage = bridgeContract.executionDailyLimitSpentPercentage

  // @todo define a specific threshold, current lower than 10%
  if (usedAmountPercentage <= MIN_EXECUTION_DAILY_LIMIT_THRESHOLD) return null

  return createLimitMessage(bridgeContract, type, usedAmountPercentage, totalAmount)
}

const createDailyLimitMessage = (bridgeContract: BridgeContract): Message => {
  const type = MessageType.DAILY_LIMIT
  const totalAmount = bridgeContract.dailyLimit
  const usedAmountPercentage = bridgeContract.dailyLimitSpentPercentage

  // @todo define a specific threshold, current lower than 10%
  if (usedAmountPercentage <= MIN_DAILY_LIMIT_THRESHOLD) return null

  return createLimitMessage(bridgeContract, type, usedAmountPercentage, totalAmount)
}

const bridgeLimits = async () => {
  const contracts = await getBridgeContracts()

  const dailyLimitMessages = contracts.map(createDailyLimitMessage).filter(Boolean)
  const executionDailyLimitMessages = contracts.map(createExecutionDailyLimitMessage).filter(Boolean)
  return dailyLimitMessages.concat(executionDailyLimitMessages)
}

export { bridgeLimits }
