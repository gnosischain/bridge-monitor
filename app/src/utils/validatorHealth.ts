import { HealthStatusTypes } from '@/src/constants/types'
import { isToday, isYesterday } from '@/src/utils/date'

export const validatorStatus = (value: number, limitWarning: number, limitError: number) => {
  let status
  if (value < limitError) {
    status = HealthStatusTypes.error
  } else if (value < limitWarning) {
    status = HealthStatusTypes.warning
  } else {
    status = HealthStatusTypes.success
  }
  return status
}

export const validatorTimeStatus = (value: number) => {
  let status
  if (isYesterday(new Date(value))) {
    status = HealthStatusTypes.warning
  } else if (!isToday(new Date(value))) {
    status = HealthStatusTypes.error
  } else {
    status = HealthStatusTypes.success
  }
  return status
}
