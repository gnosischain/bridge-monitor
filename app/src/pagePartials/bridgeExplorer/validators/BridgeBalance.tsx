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
const Text = styled.span``

const Value = styled.span`
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
`

interface Props {
  balanceType?: BalanceType
}

export const BridgeBalance: React.FC<Props> = ({ balanceType }) => {
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
