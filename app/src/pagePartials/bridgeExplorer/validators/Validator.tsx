import styled from 'styled-components'

import { InnerCard } from '@/src/components/card/InnerCard'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { Balance } from '@/src/pagePartials/bridgeExplorer/validators/Balance'
import { ValidatorHeader } from '@/src/pagePartials/bridgeExplorer/validators/ValidatorHeader'
import { HealthStatusTypes } from '@/src/constants/types'
import { useDate } from '@/src/hooks/useDate'
import { Validator as ValidatorType } from '@/src/utils/validators'
import { getAddressScanUrl } from '@/src/utils/transactions'
import {
  TELEPATHY_VALIDATOR_ADDRESS,
  TELEPATHY_VALIDATOR_ADDRESS_REPLACED,
} from '@/src/constants/misc'

const Wrapper = styled(InnerCard)`
  min-height: var(--validator-item-min-height);
  padding: calc(var(--theme-common-space) * 3)
    calc(var(--theme-common-space) + var(--theme-common-space) / 2);
  row-gap: calc(var(--theme-common-space) * 3);

  > *:last-child {
    margin-top: auto;
  }
`

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--theme-common-space);
`

const Row = styled.div`
  align-items: flex-end;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Text = styled.span`
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
`

const Value = styled.span`
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
`

const SubTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 300;
  margin: 0;
`

const Address = styled(TokenAddress)`
  font-size: 1.4rem;

  svg {
    color: ${({ theme: { colors } }) => colors.primary_50};

    &:hover {
      color: ${({ theme: { colors } }) => colors.primary};
    }
  }
`

interface Props {
  bridgeValidator: ValidatorType
}

export const Validator: React.FC<Props> = ({ bridgeValidator, ...restProps }) => {
  const balanceGnosis = bridgeValidator.balanceHome
  const lastSeen = bridgeValidator.lastSeen ?? Date.now()
  const dateLastSeen = useDate(new Date(lastSeen))
  const lastSeenTime = `${dateLastSeen.duration?.interval} ${dateLastSeen.duration?.epoch}${dateLastSeen.getSuffix}`

  const validatorAddress =
    bridgeValidator.address?.toLowerCase() === TELEPATHY_VALIDATOR_ADDRESS.toLowerCase()
      ? TELEPATHY_VALIDATOR_ADDRESS_REPLACED
      : bridgeValidator.address

  // @todo adds validator label
  const validatorHealth = () => {
    return HealthStatusTypes.success
  }

  return (
    <Wrapper {...restProps}>
      <ValidatorHeader
        shortName={bridgeValidator.shortName}
        title={bridgeValidator.name ?? ''}
        validatorHealth={validatorHealth()}
      />
      <Rows>
        <Row>
          <Text>Last seen</Text>
          <Value>{lastSeenTime}</Value>
        </Row>
        <Row>
          <Text>Signed (24hs)</Text>
          <Value>{bridgeValidator.signed}</Value>
        </Row>

        <Row>
          <Text>Executed (24hs)</Text>
          <Value>{bridgeValidator.executed}</Value>
        </Row>
      </Rows>
      <SubTitle>Balance</SubTitle>
      <Row>
        <Balance balanceType={balanceGnosis} />
      </Row>

      <Row>
        <Text>Send tokens</Text>
        <Address
          address={validatorAddress}
          characters={6}
          copy
          href={getAddressScanUrl(validatorAddress, bridgeValidator.scanUrl ?? 'gnosis')}
        />
      </Row>
    </Wrapper>
  )
}
