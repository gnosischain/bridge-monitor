import ETHIcon from '@/public/images/icons/eth.png'
import GnosisIcon from '@/public/images/icons/gnosis.png'
import DAIIcon from '@/public/images/icons/dai.png'
import XDAIIcon from '@/public/images/icons/xdai.png'

export const getIcon = (name: string) => {
  return name === 'eth'
    ? ETHIcon
    : name === 'gnosis'
    ? GnosisIcon
    : name === 'xdai'
    ? XDAIIcon
    : name === 'dai'
    ? DAIIcon
    : ''
}
