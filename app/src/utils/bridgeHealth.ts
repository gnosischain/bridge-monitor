import { HealthStatusTypes } from '@/src/constants/types'

export const bridgeContractHealth = (percentage: number) => {
  let bridgeContractStatus
  if (percentage > 80) {
    bridgeContractStatus = HealthStatusTypes.error
  } else if (percentage > 50) {
    bridgeContractStatus = HealthStatusTypes.warning
  } else {
    bridgeContractStatus = HealthStatusTypes.success
  }
  return bridgeContractStatus
}

export const currentBridgeStatus = (
  bridgeNativeHealthPercentage: number,
  bridgeForeignHealthPercentage: number,
) => {
  const bridgeNativeHealth = bridgeContractHealth(bridgeNativeHealthPercentage)
  const bridgeForeignHealth = bridgeContractHealth(bridgeForeignHealthPercentage)
  const bridgeError =
    bridgeNativeHealth === HealthStatusTypes.error ||
    bridgeForeignHealth === HealthStatusTypes.error
  const bridgeWarning =
    bridgeNativeHealth === HealthStatusTypes.warning ||
    bridgeForeignHealth === HealthStatusTypes.warning
  let bridgeStatus

  if (bridgeError) {
    bridgeStatus = HealthStatusTypes.error
  } else if (bridgeWarning) {
    bridgeStatus = HealthStatusTypes.warning
  } else {
    bridgeStatus = HealthStatusTypes.success
  }
  return bridgeStatus
}
