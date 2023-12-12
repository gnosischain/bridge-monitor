import styled from 'styled-components'

import { MiniCard, MiniCardTitle, MiniCardValue } from '@/src/components/common/MiniCard'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Tooltip } from '@/src/components/tooltip/Tooltip'

const Wrapper = styled(MiniCard)`
  flex-direction: column;
`

const TokenWrapper = styled.div`
  align-items: center;
  display: flex;
  column-gap: 8px;
`

export const Token: React.FC<{
  title: string
  tooltip?: string
  tokenSymbol: string
  value: string
}> = ({ title, tokenSymbol, tooltip, value, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <MiniCardTitle
        title={
          <>
            {title} {tooltip && <Tooltip content={tooltip} />}
          </>
        }
      />
      <TokenWrapper>
        <TokenIcon dimensions={18} symbol={tokenSymbol} />
        <MiniCardValue>{value}</MiniCardValue>
      </TokenWrapper>
    </Wrapper>
  )
}
