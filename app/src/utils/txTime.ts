export const mainnetToGnosisTime = '30'
export const gnosisToMainnetTime = '20'

export const txTime = (initiatorNetwork: string, receiverNetwork: string): string => {
  const mainnetToGnosis =
    initiatorNetwork.toLowerCase() === 'mainnet' && receiverNetwork.toLowerCase() === 'gnosis'

  return mainnetToGnosis ? mainnetToGnosisTime : gnosisToMainnetTime
}
