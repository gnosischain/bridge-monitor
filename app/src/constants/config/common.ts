export const appName = process.env.NEXT_PUBLIC_APP_NAME || 'letsHopeWeCanAvoidNameClashingThen'
export const cookiesWarningEnabled =
  process.env.NEXT_PUBLIC_COOKIES_WARNING_ENABLED === 'true' || ''
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export const RPC_MAINNET = process.env.NEXT_PUBLIC_RPC_MAINNET || 'https://rpc.ankr.com/eth'
export const RPC_GNOSIS = process.env.NEXT_PUBLIC_RPC_GNOSIS || 'https://rpc.ankr.com/gnosis'
export const RPC_GOERLI = process.env.NEXT_PUBLIC_RPC_GOERLI || 'https://rpc.ankr.com/eth_goerli'
