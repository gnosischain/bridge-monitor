import styled from 'styled-components'

import { MiniCard, MiniCardTitle, MiniCardValue } from '@/src/components/common/MiniCard'
import { Tooltip } from '@/src/components/tooltip/Tooltip'

const Wrapper = styled(MiniCard)`
  flex-direction: column;
  row-gap: 4px;
`

interface Props {
  title: string
  tooltip?: string
  value: string
}

export const TransactionLimit: React.FC<Props> = ({ title, tooltip, value, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <MiniCardTitle
        bigTitle
        title={
          <>
            {title} {tooltip && <Tooltip content={tooltip} />}
          </>
        }
      />
      <MiniCardValue>{value}</MiniCardValue>
    </Wrapper>
  )
}
