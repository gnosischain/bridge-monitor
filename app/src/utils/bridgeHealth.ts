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
