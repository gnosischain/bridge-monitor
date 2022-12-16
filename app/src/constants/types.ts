export enum ThemeType {
  light = 'light',
  dark = 'dark',
  noTheme = 'noTheme',
}

export enum ToastStates {
  failed = 'FAILED',
  success = 'SUCCESS',
  waiting = 'WAITING',
}

export enum StatusTypes {
  default = 'default',
  pending = 'pending',
  submitted = 'submitted',
  submittedExecuted = 'submittedExecuted',
  executed = 'executed',
  notRequired = 'notRequired',
}

export type BalanceType = {
  chain: string
  token: string
  value: string
}

export enum HealthStatusTypes {
  error = 'error',
  warning = 'warning',
  success = 'ok',
}
