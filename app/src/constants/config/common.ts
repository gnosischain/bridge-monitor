export const appName = process.env.NEXT_PUBLIC_APP_NAME || 'letsHopeWeCanAvoidNameClashingThen'
export const cookiesWarningEnabled =
  process.env.NEXT_PUBLIC_COOKIES_WARNING_ENABLED === 'true' || ''
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export const RPC_MAINNET = process.env.NEXT_PUBLIC_RPC_MAINNET || ''
export const RPC_GNOSIS = process.env.NEXT_PUBLIC_RPC_GNOSIS || ''
export const RPC_CHIADO = process.env.NEXT_PUBLIC_RPC_CHIADO || ''

export const WALLET_CONNECT_DAPP_URL = process.env.NEXT_PUBLIC_WALLET_CONNECT_DAPP_URL || ''
export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
