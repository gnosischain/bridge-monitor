import styled from 'styled-components'

import {
  MiniCard,
  MiniCardHeader,
  MiniCardValue,
} from '@/src/pagePartials/bridgeExplorer/bridges/MiniCard'
import { Tooltip } from '@/src/components/tooltip'
import { HealthStatusTypes } from '@/src/constants/types'
import { bridgeContractHealth } from '@/src/utils/bridgeHealth'
import { NumberType, formatCurrencyAmount, formatNumber } from '@/src/utils/format'

const Wrapper = styled(MiniCard)`
  flex-direction: column;
`

const Progress = styled.div`
  --border-radius: 4px;

  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  height: 8px;
  overflow: hidden;
  position: relative;
`

const ProgressBar = styled.div<{ status: string; width: number }>`
  background: ${(props) =>
    props.status === HealthStatusTypes.success
      ? ({ theme }) => theme.colors.success
      : props.status === HealthStatusTypes.warning
        ? ({ theme }) => theme.colors.warning
        : props.status === HealthStatusTypes.error
          ? ({ theme }) => theme.colors.error
          : ({ theme }) => theme.colors.warning};
  border-radius: var(--border-radius);
  height: 100%;
  left: 0;
  line-height: 10px;
  overflow: hidden;
  position: absolute;
  top: 0;
  transition: width 1s ease-in-out;
  width: ${(props) => props.width}%;
`

const Amounts = styled.div`
  column-gap: var(--theme-common-space);
  display: flex;
  justify-content: space-between;
`

const Amount = styled(MiniCardValue)`
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.2rem;
`

interface Props {
  darkBackground?: boolean
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
  const usedNumber = formatNumber(used.value)
  const fundsNumber = formatNumber(funds)

  return (
    <Wrapper {...restProps}>
      <MiniCardHeader
        bigTitle
        subTitle={
          <>
            Max. allowed {fundsNumber} {tooltip && <Tooltip content={tooltip} />}
          </>
        }
        title={title}
      />
      <Progress>
        <ProgressBar status={bridgeHealth} width={percentage} />
      </Progress>
      <Amounts>
        <Tooltip
          content={formatCurrencyAmount(used.value, NumberType.PortfolioBalance)}
          key="usedAmount"
        >
          <Amount>
            {used.title} {usedNumber}
          </Amount>
        </Tooltip>
        <Amount style={{ marginLeft: 'auto' }}>Remaining {formatNumber(funds - used.value)}</Amount>
      </Amounts>
    </Wrapper>
  )
}
