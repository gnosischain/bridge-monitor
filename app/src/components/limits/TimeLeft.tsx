import styled from 'styled-components'

import { useDate } from '@/src/hooks/useDate'
import { Tooltip } from '@/src/components/common/Tooltip'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  justify-content: space-between;
  line-height: 1.2;
`

interface Props {
  time: number
}

export const TimeLeft: React.FC<Props> = ({ time, ...restProps }) => {
  const date = new Date(time)
  const { getSuffixRemaining, remaining } = useDate(date)
  return (
    <Wrapper {...restProps}>
      <span>Daily limit reset</span>{' '}
      <Tooltip text={date.toLocaleString()}>
        {remaining?.interval} {remaining?.epoch}
        {getSuffixRemaining}
      </Tooltip>
    </Wrapper>
  )
}
