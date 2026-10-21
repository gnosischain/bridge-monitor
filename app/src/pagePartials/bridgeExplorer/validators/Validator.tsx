import styled from 'styled-components'

import { TokenAddress } from '@/src/components/token/TokenAddress'
import { Balance } from '@/src/pagePartials/bridgeExplorer/validators/Balance'
import { CellLabel, ListColumnsCSS } from '@/src/pagePartials/bridgeExplorer/validators/List'
import { ValidatorHeader } from '@/src/pagePartials/bridgeExplorer/validators/ValidatorHeader'
import { HealthStatusTypes } from '@/src/constants/types'
import { useDate } from '@/src/hooks/useDate'
import { Validator as ValidatorType } from '@/src/utils/validators'
import { getAddressScanUrl } from '@/src/utils/transactions'

const Wrapper = styled.div`
  display: grid;
  gap: calc(var(--theme-common-space) * 2);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: calc(var(--theme-common-space) * 2.5) calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: calc(var(--theme-common-space) * 2.5) calc(var(--theme-common-space) * 3);
  }

  ${ListColumnsCSS}

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding-bottom: calc(var(--theme-common-space) * 2);
    padding-top: calc(var(--theme-common-space) * 2);
  }
`

const Cell = styled.div`
  color: ${({ theme: { colors } }) => colors.ink};
  display: flex;
  flex-direction: column;
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  min-width: 0;
  row-gap: 4px;
`

const WideCell = styled(Cell)`
  grid-column: 1 / -1;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-column: auto;
  }
`

const Address = styled(TokenAddress)`
  svg {
    color: ${({ theme: { colors } }) => colors.faint};

    &:hover {
      color: ${({ theme: { colors } }) => colors.ink};
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

  // @todo adds validator label
  const validatorHealth = () => {
    return HealthStatusTypes.success
  }

  return (
    <Wrapper {...restProps}>
      <WideCell>
        <ValidatorHeader
          shortName={bridgeValidator.shortName}
          title={bridgeValidator.name ?? ''}
          validatorHealth={validatorHealth()}
        />
      </WideCell>
      <Cell>
        <CellLabel>Last seen</CellLabel>
        {lastSeenTime}
      </Cell>
      <Cell>
        <CellLabel>Signed (24h)</CellLabel>
        {bridgeValidator.signed}
      </Cell>
      <Cell>
        <CellLabel>Executed (24h)</CellLabel>
        {bridgeValidator.executed}
      </Cell>
      <Cell>
        <CellLabel>Balance</CellLabel>
        <Balance balanceType={balanceGnosis} />
      </Cell>
      <WideCell>
        <CellLabel>Address</CellLabel>
        <Address
          address={bridgeValidator.address}
          characters={6}
          copy
          href={getAddressScanUrl(bridgeValidator.address, bridgeValidator.scanUrl ?? 'gnosis')}
        />
      </WideCell>
    </Wrapper>
  )
}
