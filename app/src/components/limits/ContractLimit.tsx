import styled from 'styled-components'

import { MiniCard, MiniCardTitle, MiniCardValue } from '@/src/components/common/MiniCard'
import { Tooltip } from '@/src/components/tooltip/Tooltip'
import { HealthStatusTypes } from '@/src/constants/types'
import { bridgeContractHealth } from '@/src/utils/bridgeHealth'
import { NumberType, formatCurrencyAmount, formatNumber } from '@/src/utils/format'

const Wrapper = styled(MiniCard)`
  flex-direction: column;
`

const Progress = styled.div`
  background: #000;
  border-radius: 4px;
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
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
  justify-content: space-between;
`

const Amount = styled(MiniCardValue)`
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.2rem;
`

interface Props {
  funds: number
  percentage: number
  title: string
  token: string
  tooltip?: string
  used: number
}

export const ContractLimit: React.FC<Props> = ({
  funds,
  percentage,
  title,
  token,
  tooltip,
  used,
  ...restProps
}) => {
  const bridgeHealth = bridgeContractHealth(percentage)
  const usedNumber = formatNumber(used)
  const fundsNumber = formatNumber(funds)

  return (
    <Wrapper dark {...restProps}>
      <MiniCardTitle title={title} />
      <Progress>
        <ProgressBar status={bridgeHealth} width={percentage} />
      </Progress>
      <Amounts>
        <Tooltip content={formatCurrencyAmount(used, NumberType.PortfolioBalance)} key="usedAmount">
          <Amount>
            {token} {usedNumber}
          </Amount>
        </Tooltip>
        <Amount style={{ marginLeft: 'auto' }}>
          {token} {fundsNumber}
        </Amount>
        {tooltip && <Tooltip content={tooltip} />}
      </Amounts>
    </Wrapper>
  )
}
