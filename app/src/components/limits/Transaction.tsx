import styled, { css } from 'styled-components'

import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { MiniCard, MiniCardTitle, MiniCardValue } from '@/src/components/common/MiniCard'

const Wrapper = styled(MiniCard)``

const Trend = styled.div<{ trend: 'up' | 'down' }>`
  --size: 32px;

  align-items: center;
  background: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: var(--size);
  justify-content: center;
  width: var(--size);

  ${({ trend }) =>
    trend === 'down' &&
    css`
      .arrowUp {
        transform: rotate(180deg);
      }
    `}
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
`

interface Props {
  title: string
  tooltip?: string
  trend: 'up' | 'down'
  value: string
}

export const Transaction: React.FC<Props> = ({ title, tooltip, trend, value, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Trend trend={trend}>
        <ArrowUp />
      </Trend>
      <Info>
        <MiniCardTitle title={title} tooltip={tooltip} />
        <MiniCardValue>{value}</MiniCardValue>
      </Info>
    </Wrapper>
  )
}
