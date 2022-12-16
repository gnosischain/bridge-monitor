import styled from 'styled-components'

import { useDate } from '@/src/hooks/useDate'

const Wrapper = styled.div`
  font-size: 1.2rem;
  opacity: 0.6;
  text-align: right;
  min-width: 80px;
`

interface Props {
  transactiondate: number
}

export const DateTime: React.FC<Props> = ({ transactiondate }) => {
  const dateUtils = useDate(new Date(transactiondate))

  return (
    <Wrapper>
      {dateUtils.duration?.interval} {dateUtils.duration?.epoch}
      {dateUtils.getSuffix} ago
    </Wrapper>
  )
}
