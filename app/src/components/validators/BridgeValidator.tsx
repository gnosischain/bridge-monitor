import styled from 'styled-components'

import { BridgeBalance } from '@/src/components/validators/BridgeBalance'
import { BridgeValidatorHeader } from '@/src/components/validators/BridgeValidatorHeader'
import { HealthStatusTypes } from '@/src/constants/types'
import { useDate } from '@/src/hooks/useDate'
import { Validator } from '@/src/utils/validators'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space * 3}px;
  padding: ${({ theme: { common } }) => common.space * 2}px
    ${({ theme: { common } }) => common.space + common.space / 2}px;
  background: ${({ theme: { colors } }) => colors.darkerGrey};
  box-shadow: 0px 100px 80px rgba(0, 0, 0, 0.2), 0px 38.5185px 25.4815px rgba(0, 0, 0, 0.121481),
    0px 8.14815px 6.51852px rgba(0, 0, 0, 0.0785185);
  border-radius: ${({ theme: { common } }) => common.borderRadius};
`

const Data = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0px;
  padding: 0;
  gap: ${({ theme: { common } }) => common.space}px;
`
const Row = styled.li<{ status: string }>`
  font-size: 1.4rem;
  list-style: none;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme: { common } }) => common.space}px;
  color: ${(props) =>
    props.status === HealthStatusTypes.success
      ? ({ theme }) => theme.colors.white
      : props.status === HealthStatusTypes.warning
      ? ({ theme }) => theme.colors.warning
      : props.status === HealthStatusTypes.error
      ? ({ theme }) => theme.colors.error
      : ({ theme }) => theme.colors.white};
`
const H4 = styled.h4`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.2rem;
  font-weight: 300;
  margin: 0;
`

interface Props {
  bridgeValidator: Validator
}

export const BridgeValidator: React.FC<Props> = ({ bridgeValidator }) => {
  const lastSeen = bridgeValidator.lastSeen ?? Date.now()
  const dateLastSeen = useDate(new Date(lastSeen))
  const lastSeenStatus = HealthStatusTypes.success
  const signedStatus = HealthStatusTypes.success
  const executedStatus = HealthStatusTypes.success
  const balanceGnosis = bridgeValidator.balanceHome
  const balanceMainnet = bridgeValidator.balanceForeign
  const balanceGnosisStatus = HealthStatusTypes.success
  const balanceMainnetStatus = HealthStatusTypes.success
  const lastSeenTime = `${dateLastSeen.duration?.interval} ${dateLastSeen.duration?.epoch}${dateLastSeen.getSuffix} `

  // @todo adds validator label
  const validatorHealth = () => {
    return HealthStatusTypes.success
  }

  return (
    <Wrapper>
      <BridgeValidatorHeader
        title={bridgeValidator.name ?? ''}
        validatorHealth={validatorHealth()}
      />
      <Data>
        <Row status={lastSeenStatus}>
          <span>Last seen</span>
          <span className="number">{lastSeenTime}</span>
        </Row>
        <Row status={signedStatus}>
          <span>Signed (24hs)</span>
          <span className="number">{bridgeValidator.signed}</span>
        </Row>
        <Row status={executedStatus}>
          <span>Executed (24hs)</span>
          <span className="number">{bridgeValidator.executed}</span>
        </Row>
      </Data>
      <H4>Balance</H4>
      <Data>
        <Row status={balanceGnosisStatus}>
          <BridgeBalance balanceType={balanceGnosis} />
        </Row>
        <Row status={balanceMainnetStatus}>
          <BridgeBalance balanceType={balanceMainnet} />
        </Row>
      </Data>
    </Wrapper>
  )
}
