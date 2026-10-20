import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/pagePartials/bridgeExplorer/validators/ChainToken'
import { BalanceType } from '@/src/constants/types'
import { getChainIconName, getIcon } from '@/src/utils/icons'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  min-width: 0;
`

const Value = styled.span`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
`

interface Props {
  balanceType?: BalanceType
}

export const Balance: React.FC<Props> = ({ balanceType }) => {
  const iconPath = getIcon(getChainIconName(balanceType?.chain))

  return (
    <Wrapper>
      {iconPath && (
        <ChainToken name={balanceType?.chain ?? ''}>
          <Image
            alt={balanceType ? balanceType.chain : 'Chain'}
            height={16}
            src={iconPath}
            style={{
              objectFit: 'cover',
            }}
            width={16}
          />
        </ChainToken>
      )}
      <Value>
        {balanceType?.value} {balanceType?.token}
      </Value>
    </Wrapper>
  )
}
