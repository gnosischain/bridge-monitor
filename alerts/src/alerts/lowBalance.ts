import { gnosisScanAddressURL, mainnetScanAddressLink } from "../chains"
import { TokenBalance } from "../tokens"
import { fetchValidators, Validator } from "../validators"
import { Message, MessageType } from "./messages"

// @todo add logic to disable alert

// @todo define better thresholds for each token
const MIN_XDAI_BALANCE_THRESHOLD = 0.5
const MIN_ETH_BALANCE_THRESHOLD = 0.5

const getXDAIBalance = (v: Validator) => v.tokensBalances[0]
const getETHBalance = (v: Validator) => v.tokensBalances[1]

const createTitle = (validator: Validator, token: TokenBalance) => `Validator ${validator.name} has low ${token.name} balance`

const createBody = (validator: Validator, token: TokenBalance) => `The validator ${validator.name} has *${token.balance}* of *${token.name}* balance`

const createBalanceMessage = (validator: Validator, token: TokenBalance, link: string) => {
  return {
    title: createTitle(validator, token),
    type: MessageType.LOW_BALANCE,
    createdBy: validator.name,
    createdByLink: link,
    timestamp: new Date(),
    body: createBody(validator, token),
  }
}

const createValidatorXDAIBalanceMessage = (validator: Validator): Message => {
  const token = getXDAIBalance(validator)
  const scanLink = gnosisScanAddressURL(validator.address)

  // @todo define a specific threshold
  if (token.balance > MIN_XDAI_BALANCE_THRESHOLD) return null

  return createBalanceMessage(validator, token, scanLink)
}

const createValidatorETHBalanceMessage = (validator: Validator): Message => {
  const token = getETHBalance(validator)
  const scanLink = mainnetScanAddressLink(validator.address)

  // @todo define a specific threshold
  if (token.balance > MIN_ETH_BALANCE_THRESHOLD) return null

  return createBalanceMessage(validator, token, scanLink)
}

const lowBalanceAlerts = async (): Promise<Message[]> => {
  const validators = await fetchValidators()
  
  const lowETHMessages = validators.map(createValidatorETHBalanceMessage).filter(Boolean)
  const lowXDAIMessages = validators.map(createValidatorXDAIBalanceMessage).filter(Boolean)
  return lowETHMessages.concat(lowXDAIMessages)
}

export { lowBalanceAlerts }
