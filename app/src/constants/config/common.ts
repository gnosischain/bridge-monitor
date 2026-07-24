export const appName = process.env.NEXT_PUBLIC_APP_NAME || 'letsHopeWeCanAvoidNameClashingThen'
export const cookiesWarningEnabled =
  process.env.NEXT_PUBLIC_COOKIES_WARNING_ENABLED === 'true' || ''
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

// Build metadata (injected at build time on non-production deploys only)
export const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || ''
export const appEnv = process.env.NEXT_PUBLIC_APP_ENV || ''

export const WALLET_CONNECT_DAPP_URL = process.env.NEXT_PUBLIC_WALLET_CONNECT_DAPP_URL || ''
export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const USDS_ADDRESS = '0xdC035D45d973E3EC169d2276DDab16f1e407384F'
