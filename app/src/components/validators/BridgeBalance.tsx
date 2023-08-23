import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/components/common/ChainToken'
import { BalanceType } from '@/src/constants/types'

import { getIcon } from '@/src/utils/icons'

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
  const getNetworkIcon = (network?: string) => {
    return network === 'xdai' ? 'eth' : 'gnosis'
  }

  return (
    <>
      <Chain>
        <ChainToken name={balanceType?.chain ?? ''}>
          <Image
            alt={balanceType?.chain}
            height={16}
            objectFit="cover"
            src={getIcon(getNetworkIcon(balanceType?.chain))}
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
