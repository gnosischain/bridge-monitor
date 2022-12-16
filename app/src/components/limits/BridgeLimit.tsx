import styled from 'styled-components'

import { ContractLimit } from '@/src/components/limits/ContractLimit'
import { LimitLabel } from '@/src/components/limits/LimitLabel'
import { TimeLeft } from '@/src/components/limits/TimeLeft'
import { currentBridgeStatus } from '@/src/utils/bridgeHealth'
import { percentageNumber } from '@/src/utils/formatNumber'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme: { common } }) => common.space * 4}px
    ${({ theme: { common } }) => common.space * 2}px
    ${({ theme: { common } }) => common.space * 2}px;
  gap: ${({ theme: { common } }) => common.space * 3}px;
  background: ${({ theme: { colors } }) => colors.darkerGrey};
  box-shadow: 0px 100px 80px rgba(0, 0, 0, 0.2), 0px 38.5185px 25.4815px rgba(0, 0, 0, 0.121481),
    0px 8.14815px 6.51852px rgba(0, 0, 0, 0.0785185);
  border-radius: ${({ theme: { common } }) => common.borderRadius};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme: { common } }) => common.space}px;
  h4 {
    font-family: ${({ theme: { fonts } }) => fonts.family};
    margin: 0;
    font-weight: 500;
    font-size: 1.8rem;
  }
`

interface Props {
  bridge?: string
  limitLabel: string
  contractNativeUsed: number
  contractNativeFunds: number
  contractForeignUsed: number
  contractForeignFunds: number
  bridgeReset: number
}

export const BridgeLimit: React.FC<Props> = ({
  bridge,
  bridgeReset,
  contractForeignFunds = 10000000,
  contractForeignUsed = 8000000,
  contractNativeFunds = 10000000,
  contractNativeUsed = 5000000,
  limitLabel,
}) => {
  const bridgeNativeHealthPercentage = percentageNumber(contractNativeUsed, contractNativeFunds)
  const bridgeforeignHealthPercentage = percentageNumber(contractForeignUsed, contractForeignFunds)
  const bridgesHealth = currentBridgeStatus(
    bridgeNativeHealthPercentage,
    bridgeforeignHealthPercentage,
  )

  return (
    <Wrapper>
      <Header>
        <h4>{bridge}</h4>
        <LimitLabel status={bridgesHealth} text={limitLabel} />
      </Header>
      <ContractLimit
        funds={contractNativeFunds}
        percentage={percentageNumber(contractNativeUsed, contractNativeFunds)}
        text="Native (Gnosis Chain)"
        token="xDAI"
        used={contractNativeUsed}
      />
      <ContractLimit
        funds={contractForeignFunds}
        percentage={percentageNumber(contractForeignUsed, contractForeignFunds)}
        text="Foreign (Mainnet)"
        token="ETH"
        used={contractForeignUsed}
      />
      <TimeLeft time={bridgeReset} />
    </Wrapper>
  )
}
