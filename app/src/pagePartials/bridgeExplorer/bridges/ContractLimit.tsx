import styled from 'styled-components'

import { Tooltip } from '@/src/components/tooltip'
import { HealthStatusTypes } from '@/src/constants/types'
import { bridgeContractHealth } from '@/src/utils/bridgeHealth'
import { NumberType, formatNumber } from '@/src/utils/format'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--theme-common-space);
`

const Top = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 2px calc(var(--theme-common-space) * 2);
  justify-content: space-between;
`

const Title = styled.span`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
`

const Max = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  column-gap: 6px;
  display: flex;
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
`

const Progress = styled.div`
  background-color: ${({ theme: { colors } }) => colors.lilac};
  border-radius: 999px;
  height: 6px;
  overflow: hidden;
  position: relative;
`

const ProgressBar = styled.div<{ status: string; width: number }>`
  background-color: ${({ status, theme: { colors } }) =>
    status === HealthStatusTypes.success
      ? colors.success
      : status === HealthStatusTypes.error
        ? colors.error
        : colors.warning};
  border-radius: 999px;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition: width 1s ease-in-out;
  width: ${({ width }) => width}%;
`

const Amounts = styled.div`
  color: ${({ theme: { colors } }) => colors.fog};
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
  justify-content: space-between;
  line-height: 1.4;

  strong {
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 500;
  }
`

interface Props {
  funds: number
  percentage: number
  title: string
  tooltip?: string
  used: { value: number; title?: string }
}

export const ContractLimit: React.FC<Props> = ({
  funds,
  percentage,
  title,
  tooltip,
  used,
  ...restProps
}) => {
  const bridgeHealth = bridgeContractHealth(percentage)

  return (
    <Wrapper {...restProps}>
      <Top>
        <Title>{title}</Title>
        <Max>
          Max. allowed {formatNumber(funds)}
          {tooltip && <Tooltip content={tooltip} />}
        </Max>
      </Top>
      <Progress>
        <ProgressBar status={bridgeHealth} width={percentage} />
      </Progress>
      <Amounts>
        <Tooltip content={formatNumber(used.value, NumberType.PortfolioBalance)}>
          <span>
            {used.title} <strong>{formatNumber(used.value)}</strong>
          </span>
        </Tooltip>
        <span>
          Remaining <strong>{formatNumber(funds - used.value)}</strong>
        </span>
      </Amounts>
    </Wrapper>
  )
}
