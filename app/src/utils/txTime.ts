export const mainnetToGnosisTime = '17'
export const gnosisToMainnetTime = '5'

export const txTime = (initiatorNetwork: string): string =>
  initiatorNetwork.toLowerCase() === 'mainnet' ? mainnetToGnosisTime : gnosisToMainnetTime
