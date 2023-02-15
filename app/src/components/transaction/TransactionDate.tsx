import styled from 'styled-components'

import { IconClock as BaseIconClock } from '@/src/components/assets/IconClock'
import { useDate } from '@/src/hooks/useDate'
import { DateFormated } from '@/src/utils/date'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  font-size: 1.4rem;
  line-height: 1.2;
  column-gap: ${({ theme: { common } }) => common.space}px;
  margin: auto 0 0 0;
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
  let dateInfo
  const dateUtils = useDate(new Date(started))
  dateInfo =
    dateUtils.duration?.interval + ' ' + dateUtils.duration?.epoch + dateUtils.getSuffix + ' ago'
  if (completed) {
    dateInfo = DateFormated(new Date(completed))
  }
  return (
    <Wrapper {...restProps}>
      <IconClock /> <Text>{dateInfo}</Text>
    </Wrapper>
  )
}
