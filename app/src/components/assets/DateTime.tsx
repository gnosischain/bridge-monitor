import styled from 'styled-components'

import { useDate } from '@/src/hooks/useDate'
import { DateFormated } from '@/src/utils/date'
import { Tooltip } from '@/src/components/common/Tooltip'

const Wrapper = styled.div`
  position: relative;
`

const Text = styled.div`
  font-size: 1.2rem;
  line-height: 1.2;
  opacity: 0.6;
`

interface Props {
  transactiondate: number
}

export const DateTime: React.FC<Props> = ({ transactiondate, ...restProps }) => {
  const sinceDateFormat = useDate(new Date(transactiondate))
  const DateFormat = DateFormated(new Date(transactiondate))

  return (
    <Wrapper {...restProps}>
      <Tooltip key={`transaction_date_${transactiondate}`} text={DateFormat}>
        <Text>
          {sinceDateFormat.duration?.interval} {sinceDateFormat.duration?.epoch}
          {sinceDateFormat.getSuffix} ago
        </Text>
      </Tooltip>
    </Wrapper>
  )
}
