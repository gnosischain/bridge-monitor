import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/components/assets/ChainToken'
import { BalanceType } from '@/src/constants/types'

const Chain = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme: { common } }) => common.space}px;
`
const Name = styled.span`
  font-size: 1.2rem;
  font-weight: 300;
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    display: inline;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    display: none;
  }
`

interface Props {
  balanceType?: BalanceType
}

export const BridgeBalance: React.FC<Props> = ({ balanceType }) => {
  const getChainIcon = (chain?: string) => {
    return chain === 'Mainnet' ? '/images/icons/eth.png' : '/images/icons/gnosis.png'
  }
  return (
    <>
      <Chain>
        <ChainToken name={balanceType?.chain ?? ''}>
          <Image
            alt={balanceType?.chain}
            height={16}
            objectFit="cover"
            src={getChainIcon(balanceType?.chain)}
            width={16}
          />
        </ChainToken>
        <Name>{balanceType?.chain}</Name>
      </Chain>
      <span className="number">
        {balanceType?.value} {balanceType?.token}
      </span>
    </>
  )
}
