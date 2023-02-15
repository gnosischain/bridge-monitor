import styled from 'styled-components'

import { useDate } from '@/src/hooks/useDate'
import { useGeneral } from '@/src/providers/generalProvider'
import { DateFormated } from '@/src/utils/date'

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
  const sinceDateFormat = useDate(new Date(transactiondate))
  const DateFormat = DateFormated(new Date(transactiondate))
  const { isTimeAgo } = useGeneral()
  return (
    <Wrapper>
      {isTimeAgo ? (
        <>
          {sinceDateFormat.duration?.interval} {sinceDateFormat.duration?.epoch}
          {sinceDateFormat.getSuffix} ago
        </>
      ) : (
        <>{DateFormat}</>
      )}
    </Wrapper>
  )
}
