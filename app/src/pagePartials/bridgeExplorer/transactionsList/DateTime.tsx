import styled from 'styled-components'

import { useDate } from '@/src/hooks/useDate'
import { DateFormated } from '@/src/utils/date'
import { Tooltip as BaseTooltip } from '@/src/components/tooltip'

const Wrapper = styled(BaseTooltip)`
  display: inline;
`

const Text = styled.div`
  font-size: 1.2rem;
  line-height: 1.2;
  max-width: fit-content;
  opacity: 0.8;
`

interface Props {
  transactiondate: number
}

export const DateTime: React.FC<Props> = ({ transactiondate, ...restProps }) => {
  const sinceDateFormat = useDate(new Date(transactiondate))
  const DateFormat = DateFormated(new Date(transactiondate))

  return sinceDateFormat.duration?.interval ? (
    <Wrapper content={DateFormat} key={`transaction_date_${transactiondate}`} {...restProps}>
      <Text>
        {sinceDateFormat.duration?.interval} {sinceDateFormat.duration?.epoch}
        {sinceDateFormat.getSuffix} ago
      </Text>
    </Wrapper>
  ) : (
    <></>
  )
}
