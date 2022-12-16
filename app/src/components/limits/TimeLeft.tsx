import styled from 'styled-components'

import { useDate } from '@/src/hooks/useDate'

const Wrapper = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  padding: ${({ theme: { common } }) => common.space}px 0;
`

interface Props {
  time: number
}

export const TimeLeft: React.FC<Props> = ({ time }) => {
  const dateBridgeReset = useDate(new Date(time))
  return (
    <Wrapper>
      Daily limit reset in {dateBridgeReset.remaining?.interval} {dateBridgeReset.remaining?.epoch}
      {dateBridgeReset.getSuffixRemaining}
    </Wrapper>
  )
}
