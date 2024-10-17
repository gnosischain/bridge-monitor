import styled, { css } from 'styled-components'

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
import { IconLink } from '@/src/components/assets/IconLink'
import { Tooltip } from '@/src/components/tooltip'

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

const TextCSS = css`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.5;
`

const ExternalLink = styled.a`
  ${TextCSS}

  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  text-decoration: none;

  &:active {
    opacity: 0.8;
  }
`

const CommonCSS = css`
  transition: color 0.15s ease-in-out;

  &:hover {
    color: ${({ theme: { colors } }) => colors.primaryDark};
  }

  &:active {
    opacity: 0.6;
  }
`

const Link = styled(IconLink)`
  color: ${({ theme: { colors } }) => colors.primary_50};
  cursor: pointer;

  ${CommonCSS}

  svg {
    color: ${({ theme: { colors } }) => colors.primary_50};

    &:hover {
      color: ${({ theme: { colors } }) => colors.primary};
    }
  }
`

const ExternalLinkWrapper = styled.span`
  display: flex;
  align-items: center;
  column-gap: var(--theme-common-space);
`

const HashiTooltip = styled(Tooltip)`
  flex-grow: 1;
  margin-left: var(--theme-common-space);
`

const HashiTooltipWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-grow: 1;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openLink = (e: any, href: string) => {
    e.stopPropagation()
    e.preventDefault()

    window.open(href, '_blank', 'noopener noreferrer')
  }

  const isHashi = bridgeValidator.shortName === 'H'

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
          {isHashi && (
            <HashiTooltipWrapper>
              <HashiTooltip content="A message is considered signed/approved by Hashi, when a threshold amount of oracles store the same message hash w.r.t the message id." />
            </HashiTooltipWrapper>
          )}
          <Value>{bridgeValidator.signed}</Value>
        </Row>
        {isHashi ? (
          <Row>
            <Text>Executed (24hs)</Text>
            <HashiTooltipWrapper>
              <HashiTooltip content="Hashi only approves messages, the message is executed either by other bridge validators or by users." />
            </HashiTooltipWrapper>
            <Value>N/A</Value>
          </Row>
        ) : (
          <Row>
            <Text>Executed (24hs)</Text>
            <Value>{bridgeValidator.executed}</Value>
          </Row>
        )}
      </Rows>
      <SubTitle>Balance</SubTitle>
      <Row>
        {isHashi ? (
          <>
            <Text>N/A</Text>
            <HashiTooltipWrapper>
              <HashiTooltip content="Hashi don’t need to execute a message, hence balance field is not applicable." />
            </HashiTooltipWrapper>
          </>
        ) : (
          <Balance balanceType={balanceGnosis} />
        )}
      </Row>
      {isHashi ? (
        <Row>
          <Text>Find more info</Text>
          <ExternalLinkWrapper>
            <ExternalLink href="https://hashi-explorer.xyz/" rel="noreferrer" target="_blank">
              Hashi Explorer
            </ExternalLink>
            <Link
              className="externalLink"
              height={14}
              onClick={(e) => openLink(e, 'https://hashi-explorer.xyz/')}
              width={14}
            />
          </ExternalLinkWrapper>
        </Row>
      ) : (
        <Row>
          <Text>Send tokens</Text>
          <Address
            address={validatorAddress}
            characters={6}
            copy
            href={getAddressScanUrl(validatorAddress, bridgeValidator.scanUrl ?? 'gnosis')}
          />
        </Row>
      )}
    </Wrapper>
  )
}
