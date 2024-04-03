import styled from 'styled-components'

import { IconClock as BaseIconClock } from '@/src/components/assets/IconClock'
import { useDate } from '@/src/hooks/useDate'
import { DateFormated } from '@/src/utils/date'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.4rem;
  line-height: 1.2;
`

const IconClock = styled(BaseIconClock)`
  display: block;
`

const Text = styled.span`
  line-height: 1;
`

interface Props {
  completed?: number
  started?: number
}

export const TransactionDate: React.FC<Props> = ({ completed, started = 0, ...restProps }) => {
  const dateUtils = useDate(new Date(started))
  const dateInfo = completed
    ? DateFormated(new Date(completed))
    : dateUtils.duration?.interval + ' ' + dateUtils.duration?.epoch + dateUtils.getSuffix + ' ago'

  return (
    <Wrapper {...restProps}>
      <IconClock /> <Text>{dateInfo}</Text>
    </Wrapper>
  )
}
