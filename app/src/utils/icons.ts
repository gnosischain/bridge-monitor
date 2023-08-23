const ETHIcon = '/images/icons/eth.png'
const GnosisIcon = '/images/icons/gnosis.png'
const DAIIcon = '/images/icons/dai.png'
const XDAIIcon = '/images/icons/xdai.png'

export const getIcon = (name: string) => {
  return name === 'eth'
    ? ETHIcon
    : name === 'gnosis'
    ? GnosisIcon
    : name === 'xdai'
    ? XDAIIcon
    : name === 'dai'
    ? DAIIcon
    : DAIIcon
}
