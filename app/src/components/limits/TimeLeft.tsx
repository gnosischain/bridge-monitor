import styled from 'styled-components'

import { useDate } from '@/src/hooks/useDate'

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
  const dateBridgeReset = useDate(new Date(time))
  return (
    <Wrapper {...restProps}>
      <span>Daily limit reset</span>{' '}
      <span>
        {dateBridgeReset.remaining?.interval} {dateBridgeReset.remaining?.epoch}
        {dateBridgeReset.getSuffixRemaining}
      </span>
    </Wrapper>
  )
}
