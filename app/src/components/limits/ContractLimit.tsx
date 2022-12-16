import styled from 'styled-components'

import { HealthStatusTypes } from '@/src/constants/types'
import { bridgeContractHealth } from '@/src/utils/bridgeHealth'
import { formatNumber } from '@/src/utils/formatNumber'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space}px;
  h5 {
    margin: 0;
    font-weight: 400;
    font-size: 1.4rem;
  }
`
const Progress = styled.div`
  height: 10px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
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
  border-radius: 4px;
  height: 10px;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: ${(props) => props.width}%;
  color: ${({ theme: { colors } }) => colors.black};
  font-size: 1rem;
  font-weight: bold;
  line-height: 10px;
  text-align: center;
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  transition: width 1s ease-in-out;
`
const Amounts = styled.div`
  display: flex;
  justify-content: space-between;
`
const Amount = styled.div`
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.2rem;
`

interface Props {
  text?: string
  used: number
  token: string
  funds: number
  percentage: number
}

export const ContractLimit: React.FC<Props> = ({ funds, percentage, text, token, used }) => {
  const bridgeHealth = bridgeContractHealth(percentage)
  const usedNumber = formatNumber(used)
  const fundsNumber = formatNumber(funds)
  return (
    <Wrapper>
      <h5>{text}</h5>
      <Progress>
        <ProgressBar status={bridgeHealth} width={percentage}>
          {percentage}%
        </ProgressBar>
      </Progress>
      <Amounts>
        <Amount>
          {token} {usedNumber}
        </Amount>
        <Amount>
          {token} {fundsNumber}
        </Amount>
      </Amounts>
    </Wrapper>
  )
}
