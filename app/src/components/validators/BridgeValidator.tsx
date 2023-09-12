import styled from 'styled-components'

import { InnerCard } from '@/src/components/common/InnerCard'
import { Address } from '@/src/components/token/Address'
import { BridgeBalance } from '@/src/components/validators/BridgeBalance'
import { BridgeValidatorHeader } from '@/src/components/validators/BridgeValidatorHeader'
import { HealthStatusTypes } from '@/src/constants/types'
import { useDate } from '@/src/hooks/useDate'
import { Validator } from '@/src/utils/validators'
import { getAddressScanUrl } from '@/src/utils/transactions'

const Wrapper = styled(InnerCard)`
  padding: ${({ theme: { common } }) => common.space * 3}px
    ${({ theme: { common } }) => common.space + common.space / 2}px;
  row-gap: ${({ theme: { common } }) => common.space * 3}px;
`

const Rows = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  row-gap: ${({ theme: { common } }) => common.space}px;

  &.last {
    margin: ${({ theme: { common } }) => common.space * 3}px 0 0;
  }
`

const Row = styled.li<{ status?: string }>`
  color: ${(props) =>
    props.status === HealthStatusTypes.success
      ? ({ theme }) => theme.colors.white
      : props.status === HealthStatusTypes.warning
      ? ({ theme }) => theme.colors.warning
      : props.status === HealthStatusTypes.error
      ? ({ theme }) => theme.colors.error
      : ({ theme }) => theme.colors.white};
  display: flex;
  font-size: 1.4rem;
  justify-content: space-between;
  line-height: 1.2;
  list-style: none;
`

const Text = styled.span``

const Value = styled.span`
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
`

const Balance = styled.h4`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.2rem;
  font-weight: 300;
  margin: 0;
`

interface Props {
  bridgeValidator: Validator
}

export const BridgeValidator: React.FC<Props> = ({ bridgeValidator, ...restProps }) => {
  const lastSeen = bridgeValidator.lastSeen ?? Date.now()
  const dateLastSeen = useDate(new Date(lastSeen))
  const lastSeenStatus = HealthStatusTypes.success
  const signedStatus = HealthStatusTypes.success
  const executedStatus = HealthStatusTypes.success
  const balanceGnosis = bridgeValidator.balanceHome
  const balanceGnosisStatus = HealthStatusTypes.success
  const lastSeenTime = `${dateLastSeen.duration?.interval} ${dateLastSeen.duration?.epoch}${dateLastSeen.getSuffix}`

  // @todo adds validator label
  const validatorHealth = () => {
    return HealthStatusTypes.success
  }

  return (
    <Wrapper {...restProps}>
      <BridgeValidatorHeader
        shortName={bridgeValidator.shortName}
        title={bridgeValidator.name ?? ''}
        validatorHealth={validatorHealth()}
      />
      <Rows>
        <Row status={lastSeenStatus}>
          <Text>Last seen</Text>
          <Value>{lastSeenTime}</Value>
        </Row>
        <Row status={signedStatus}>
          <Text>Signed (24hs)</Text>
          <Value>{bridgeValidator.signed}</Value>
        </Row>
        <Row status={executedStatus}>
          <Text>Executed (24hs)</Text>
          <Value>{bridgeValidator.executed}</Value>
        </Row>
      </Rows>
      <Balance>Balance</Balance>
      <Rows>
        <Row status={balanceGnosisStatus}>
          <BridgeBalance balanceType={balanceGnosis} />
        </Row>
      </Rows>
      <Rows className="last">
        <Row>
          <Text>Send tokens</Text>
          <Address
            address={bridgeValidator.address}
            characters={6}
            copy
            link={getAddressScanUrl(bridgeValidator.address, bridgeValidator.scanUrl ?? 'gnosis')}
          />
        </Row>
      </Rows>
    </Wrapper>
  )
}
