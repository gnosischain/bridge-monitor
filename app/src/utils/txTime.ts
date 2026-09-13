export const mainnetToGnosisTime = '12 seconds'
export const gnosisToMainnetTime = '5 minutes'

export const txTime = (initiatorNetwork: string): string =>
  initiatorNetwork.toLowerCase() === 'mainnet' ? mainnetToGnosisTime : gnosisToMainnetTime
