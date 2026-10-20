import { useDate } from '@/src/hooks/useDate'
import { Tooltip } from '@/src/components/tooltip'
import { Fact } from '@/src/pagePartials/bridgeExplorer/bridges/Fact'

interface Props {
  time: number
}

export const TimeLeft: React.FC<Props> = ({ time, ...restProps }) => {
  const date = new Date(time)
  const { getSuffixRemaining, remaining } = useDate(date)

  return (
    <Fact label="Daily limit resets in" {...restProps}>
      <Tooltip content={date.toLocaleString()}>
        {remaining?.interval} {remaining?.epoch}
        {getSuffixRemaining}
      </Tooltip>
    </Fact>
  )
}
