import styled, { css } from 'styled-components'

import { ChainsInitiatorReceiver } from '@/src/pagePartials/bridgeExplorer/common/ChainsInitiatorReceiver'
import { TransactionDate } from '@/src/pagePartials/bridgeExplorer/transaction/TransactionDate'
import { getAddressScanUrl } from '@/src/utils/transactions'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import {
  Initiator as BaseInitiator,
  Receiver as BaseReceiver,
} from '@/src/pagePartials/bridgeExplorer/common/TokenWithValue'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { ArrowRight } from '@/src/components/assets/ArrowRight'
import { MainCard } from '@/src/components/card/MainCard'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'

const Wrapper = styled(MainCard)`
  display: grid;
  gap: calc(var(--theme-common-space) * 2.5) calc(var(--theme-common-space) * 4);
  grid-template-columns: minmax(0, 1fr);
  padding: calc(var(--theme-common-space) * 2.5);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 4);
  }
`

const Fact = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  row-gap: var(--theme-common-space);
`

const Label = styled.span`
  ${EyebrowCSS}

  letter-spacing: 0.12em;
`

const Value = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  display: flex;
  flex-wrap: wrap;
  font-size: 1.5rem;
  font-weight: 500;
  gap: var(--theme-common-space);
  min-height: 26px;
  min-width: 0;
`

const CommonCSS = css`
  min-width: 0;

  .label {
    display: none;
  }

  .value {
    font-size: 1.5rem;
    line-height: inherit;
  }
`

const Initiator = styled(BaseInitiator)`
  ${CommonCSS}
`

const Receiver = styled(BaseReceiver)`
  ${CommonCSS}
`

const Arrow = styled(ArrowRight)`
  .fill {
    fill: ${({ theme: { colors } }) => colors.faint};
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

const Date = styled(TransactionDate)`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.5rem;
`

interface Props {
  $bridgeName: string
  $initiator: string
  $initiatorAmount: string
  $initiatorName: string
  $initiatorNetwork: string
  $initiatorNetworkIcon?: string
  $initiatorToken: string
  $receiver: string
  $receiverName: string
  $receiverNetwork: string
  $receiverNetworkIcon?: string
  $receiverToken?: string
  $timestampExecution: number
  $timestampStarted: number
}

export const Summary: React.FC<Props> = ({
  $bridgeName,
  $initiator,
  $initiatorAmount,
  $initiatorNetwork,
  $initiatorNetworkIcon,
  $initiatorToken,
  $receiver,
  $receiverNetwork,
  $receiverNetworkIcon,
  $receiverToken,
  $timestampExecution,
  $timestampStarted,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Fact>
        <Label>Bridge</Label>
        <Value>{$bridgeName === 'AMB' ? 'Omnibridge' : $bridgeName}</Value>
      </Fact>
      <Fact>
        <Label>Direction</Label>
        <Value>
          <ChainsInitiatorReceiver
            $chainIconInitiator={$initiatorNetworkIcon}
            $chainIconReceiver={$receiverNetworkIcon}
            $chainInitiator={$initiatorNetwork}
            $chainReceiver={$receiverNetwork}
          />
        </Value>
      </Fact>
      {/* @todo:
       - if transactionStatus is not completed, completed value must be empty
      */}
      <Fact>
        <Label>Date</Label>
        <Value>
          <Date completed={$timestampExecution} started={$timestampStarted} />
        </Value>
      </Fact>
      <Fact>
        <Label>Initiator</Label>
        <Value>
          <Address
            address={$initiator}
            characters={6}
            copy
            href={getAddressScanUrl($initiator, $initiatorNetwork)}
            useDomain
          />
        </Value>
      </Fact>
      <Fact>
        <Label>Receiver</Label>
        <Value>
          <Address
            address={$receiver}
            characters={6}
            copy
            href={getAddressScanUrl($receiver, $receiverNetwork)}
            useDomain
          />
        </Value>
      </Fact>
      <Fact>
        <Label>Amount</Label>
        <Value>
          <Initiator
            bridgeName={$bridgeName}
            initiatorNetwork={$initiatorNetwork}
            token={$initiatorToken}
            tokenValue={$initiatorAmount}
          />
          {$bridgeName.toLowerCase() === 'xdai' && (
            <>
              <Arrow />
              <Receiver
                bridgeName={$bridgeName}
                initiatorNetwork={$initiatorNetwork}
                receiverToken={$receiverToken}
                token={$initiatorToken}
                tokenValue={$initiatorAmount}
              />
            </>
          )}
        </Value>
      </Fact>
    </Wrapper>
  )
}

export const SummaryPlaceholder: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {Array.from({ length: 6 }).map((item, index) => (
        <Fact key={index}>
          <SkeletonLoading style={{ height: '12px', minHeight: '0', width: '35%' }} />
          <SkeletonLoading style={{ borderRadius: '8px', height: '24px', width: '70%' }} />
        </Fact>
      ))}
    </Wrapper>
  )
}
