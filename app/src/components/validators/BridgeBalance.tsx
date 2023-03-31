import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/components/common/ChainToken'
import { BalanceType } from '@/src/constants/types'

const Chain = styled.div`
  align-items: center;
  column-gap: 6px;
  display: flex;
`
const Text = styled.span``

const Value = styled.span`
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
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
        <Text>{balanceType?.chain}</Text>
      </Chain>
      <Value>
        {balanceType?.value} {balanceType?.token}
      </Value>
    </>
  )
}
