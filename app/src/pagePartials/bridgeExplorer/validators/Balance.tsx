import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/pagePartials/bridgeExplorer/validators/ChainToken'
import { BalanceType } from '@/src/constants/types'
import { useIcon } from '@/src/hooks/useIcon'
import { getChainIconName } from '@/src/utils/icons'

const Chain = styled.div`
  align-items: center;
  column-gap: 6px;
  display: flex;
`
const Text = styled.span`
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
`

const Value = styled.span`
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

interface Props {
  balanceType?: BalanceType
}

export const Balance: React.FC<Props> = ({ balanceType }) => {
  const { iconPath } = useIcon(getChainIconName(balanceType?.chain))

  return (
    <>
      <Chain>
        <ChainToken name={balanceType?.chain ?? ''}>
          {iconPath && (
            <Image
              alt={balanceType?.chain}
              height={16}
              objectFit="cover"
              src={iconPath}
              width={16}
            />
          )}
        </ChainToken>
        <Text>{balanceType?.chain}</Text>
      </Chain>
      <Value>
        {balanceType?.value} {balanceType?.token}
      </Value>
    </>
  )
}
