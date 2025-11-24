import { bridgeLimits } from "./bridgeLimits"
import { checkInactiveValidators } from "./inactiveValidators"
// import { lowBalanceAlerts } from "./lowBalance"
import { checkStuckTransactions } from "./stuckedTx"

export type Message = {
  title: string
  type: string
  createdBy: string
  createdByLink: string
  timestamp?: Date
  body: string
}

export enum MessageType {
  LOW_BALANCE = 'LowBalance',
  DAILY_LIMIT = 'DailyLimit',
  EXECUTION_DAILY_LIMIT = 'ExecutionDailyLimit',
  INACTIVE_VALIDATOR = 'InactiveValidator',
  STUCK_TRANSACTION = 'StuckTx'
}

const messages = async () => {
  // To run only certain alerts, comment out the lines for the checks you want to disable.
  const alertPromises = [
    // bridgeLimits(),
    // lowBalanceAlerts(),
   // checkInactiveValidators(),
    checkStuckTransactions(),
  ]

  const results = await Promise.all(alertPromises)

  // The flat() method removes empty arrays and filter(Boolean) removes null/undefined values.
  return results.flat().filter(Boolean) as Message[]
}

export { messages }
