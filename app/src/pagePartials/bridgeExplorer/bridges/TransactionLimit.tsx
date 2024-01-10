import styled from 'styled-components'

import {
  MiniCard,
  MiniCardHeader,
  MiniCardValue,
} from '@/src/pagePartials/bridgeExplorer/bridges/MiniCard'
import { Tooltip } from '@/src/components/tooltip'

const Wrapper = styled(MiniCard)`
  flex-direction: column;
  row-gap: var(--theme-common-space);
`

interface Props {
  title: string
  tooltip?: string
  value: string
}

export const TransactionLimit: React.FC<Props> = ({ title, tooltip, value, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <MiniCardHeader
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
