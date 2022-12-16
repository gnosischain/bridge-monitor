import { bridgeLimits } from "./bridgeLimits"
import { lowBalanceAlerts } from "./lowBalance"

export type Message = {
  title: string
  type: string
  createdBy: string
  createdByLink: string
  timestamp: Date
  body: string
}

export enum MessageType {
  LOW_BALANCE = 'LowBalance',
  DAILY_LIMIT = 'DailyLimit',
  EXECUTION_DAILY_LIMIT = 'ExecutionDailyLimit',
}

const messages = async () => {
  const bridgeLimitsAlerts = await bridgeLimits()
  const lowValidatorBalanceAlerts = await lowBalanceAlerts()
  return bridgeLimitsAlerts.concat(lowValidatorBalanceAlerts)
}

export { messages }
