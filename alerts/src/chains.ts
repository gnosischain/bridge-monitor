export const GNOSIS_SCAN_URL = 'https://gnosisscan.io/address/'
export const MAINNET_SCAN_URL = 'https://etherscan.io/address/'

export const gnosisScanAddressURL = (address: string) => {
  return `${GNOSIS_SCAN_URL}${address}`
}

export const mainnetScanAddressLink = (address: string) => {
  return `${MAINNET_SCAN_URL}${address}`
}
