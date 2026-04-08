const ETHIcon = '/images/icons/ethToken.svg'
const GnosisIcon = '/images/icons/gnosis.svg'
const ETHIconBig = '/images/icons/eth.svg'
const GnosisIconBig = '/images/icons/gnosis2.svg'
const DAIIcon = '/images/icons/dai.svg'
const XDAIIcon = '/images/icons/xdai.svg'
const InchIcon = '/images/icons/1inch.svg'
const USDSIcon = '/images/icons/usds.webp'

export const getIcon = (name?: string) => {
  const iconName = name?.toLowerCase()

  return iconName === 'eth'
    ? ETHIcon
    : iconName === 'mainnetbig'
      ? ETHIconBig
      : iconName === 'mainnet'
        ? ETHIconBig
        : iconName === 'gnosis'
          ? GnosisIcon
          : iconName === 'gnosisbig'
            ? GnosisIconBig
            : iconName === 'xdai'
              ? XDAIIcon
              : iconName === 'dai'
                ? DAIIcon
                : iconName === '1inch'
                  ? InchIcon
                  : iconName === 'usds'
                    ? USDSIcon
                    : ''
}

export const getChainIconName = (chain?: string) => {
  const network = chain?.toLowerCase()

  return network === 'mainnet' || network === 'xdai' ? 'eth' : 'gnosis'
}
