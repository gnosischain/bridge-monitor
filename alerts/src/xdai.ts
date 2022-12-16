import { gnosis, mainnet } from "./providers"
import homeXDAIBridgeCall from "./contracts/homeXDAIBridgeCall"
import { calculatePercentage, fromBNtoNumber } from "./utils"
import foreignXDAIBridgeCall from "./contracts/foreignXDAIBridgeCall"
import { addresses } from "./contracts/addresses"
import { gnosisScanAddressURL, mainnetScanAddressLink } from "./chains"

const mainnetProvider = mainnet()
const gnosisProvider = gnosis()

export type BridgeContract = {
  name: string
  address: string
  bridge: string
  dailyLimit: number
  dailyLimitSpent: number
  dailyLimitSpentPercentage: number
  executionDailyLimit: number
  executionDailyLimitSpent: number
  executionDailyLimitSpentPercentage: number
  scanURL: string
}

const homeDailyLimit = async () => {
  const daily = await homeXDAIBridgeCall(gnosisProvider, "dailyLimit", [])
  return fromBNtoNumber(daily)
}

const homeExecutionDailyLimit = async () => {
  const execution = await homeXDAIBridgeCall(gnosisProvider, "executionDailyLimit", [])
  return fromBNtoNumber(execution)
}

const foreignDailyLimit = async () => {
  const daily = await foreignXDAIBridgeCall(mainnetProvider, "dailyLimit", [])
  return fromBNtoNumber(daily)
}

const foreignExecutionDailyLimit = async () => {
  const execution = await foreignXDAIBridgeCall(mainnetProvider, "executionDailyLimit", [])
  return fromBNtoNumber(execution)
}

const homeDailyLimitSpent = async () => {
  const currentDay = await homeXDAIBridgeCall(gnosisProvider, "getCurrentDay", [])
  const dailySpent = await homeXDAIBridgeCall(gnosisProvider, "totalSpentPerDay", [currentDay])

  return fromBNtoNumber(dailySpent)
}

const foreignDailyLimitSpent = async () => {
  const currentDay = await foreignXDAIBridgeCall(mainnetProvider, "getCurrentDay", [])
  const dailySpent = await foreignXDAIBridgeCall(mainnetProvider, "totalSpentPerDay", [currentDay])

  return fromBNtoNumber(dailySpent)
}
const homeExecutionDailyLimitSpent = async () => {
  const currentDay = await homeXDAIBridgeCall(gnosisProvider, "getCurrentDay", [])
  const dailySpent = await homeXDAIBridgeCall(gnosisProvider, "totalExecutedPerDay", [currentDay])

  return fromBNtoNumber(dailySpent)
}

const foreignExecutionDailyLimitSpent = async () => {
  const currentDay = await foreignXDAIBridgeCall(mainnetProvider, "getCurrentDay", [])
  const dailySpent = await foreignXDAIBridgeCall(mainnetProvider, "totalExecutedPerDay", [currentDay])

  return fromBNtoNumber(dailySpent)
}

const fetchHomeBridgeInformation = async (): Promise<BridgeContract> => {
  // addresses.HomeBridgeErcToNative
  const name = "HomeBridgeErcToNative"
  const address = addresses.HomeBridgeErcToNative.address
  const bridge = "XDAI"
  const data = await Promise.all([
    homeDailyLimit(),
    homeDailyLimitSpent(),
    homeExecutionDailyLimit(),
    homeExecutionDailyLimitSpent(),
  ])
  const dailyLimit = data[0]
  const dailyLimitSpent = data[1]
  const executionDailyLimit = data[2]
  const executionDailyLimitSpent = data[3]
  const scanURL = gnosisScanAddressURL(address)
  const dailyLimitSpentPercentage = calculatePercentage(dailyLimitSpent, dailyLimit)
  const executionDailyLimitSpentPercentage = calculatePercentage(executionDailyLimitSpent, executionDailyLimit)
  return {
    name,
    address,
    bridge,
    dailyLimit,
    dailyLimitSpent,
    executionDailyLimit,
    executionDailyLimitSpent,
    scanURL,
    dailyLimitSpentPercentage,
    executionDailyLimitSpentPercentage,
  }
}
const fetchForeignBridgeInformation = async (): Promise<BridgeContract> => {
  // addresses.HomeBridgeErcToNative
  const name = "ForeignBridgeErcToNative"
  const address = addresses.ForeignBridgeErcToNative.address
  const bridge = "XDAI"
  const data = await Promise.all([
    foreignDailyLimit(),
    foreignDailyLimitSpent(),
    foreignExecutionDailyLimit(),
    foreignExecutionDailyLimitSpent(),
  ])
  const dailyLimit = data[0]
  const dailyLimitSpent = data[1]
  const executionDailyLimit = data[2]
  const executionDailyLimitSpent = data[3]
  const scanURL = mainnetScanAddressLink(address)
  const dailyLimitSpentPercentage = calculatePercentage(dailyLimitSpent, dailyLimit)
  const executionDailyLimitSpentPercentage = calculatePercentage(executionDailyLimitSpent, executionDailyLimit)
  return {
    name,
    address,
    bridge,
    dailyLimit,
    dailyLimitSpent,
    executionDailyLimit,
    executionDailyLimitSpent,
    scanURL,
    dailyLimitSpentPercentage,
    executionDailyLimitSpentPercentage,
  }
}

const getBridgeContracts = () => {
  return Promise.all([
    fetchHomeBridgeInformation(),
    fetchForeignBridgeInformation()
  ])
}

export { getBridgeContracts }
