import styled from 'styled-components'
import { Magnifier } from '@/src/components/assets/Magnifier'
import { shortenAddress } from '@/src/utils/tools'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Chains, ChainsKeys } from '@/src/constants/config/types'
import useBridgeProgress from '@/src/hooks/bridge/useBridgeProgress'
import formatDistance from 'date-fns/formatDistance'
import { getNetworkConfig } from '@/src/constants/config/chains'

const Wrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  box-shadow: 0 2.231px 2.775px 0px rgba(0, 0, 0, 0.01), 0 10.2px 7.8px 0 rgba(0, 0, 0, 0.01),
    0 25.819px 20.925px 0 rgba(0, 0, 0, 0.02), 0 51px 48px 0 rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 5) 0 calc(var(--theme-common-space) * 3);
`

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 400;
  margin: 0 0 calc(var(--theme-common-space) * 3);
  padding: 0 calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 2.1rem;
  }
`

const TopInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    gap: 16px;
  }
`

const BlocksInformation = styled.div`
  align-items: end;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const Completed = styled.h5`
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const Percentage = styled.span`
  font-size: 2.6rem;
  font-weight: 900;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 3.2rem;
  }
`

const CompletedBlocks = styled.span`
  font-size: 1.6rem;
  line-height: 1.2;
`

const Progress = styled.div`
  --border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};

  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: var(--border-radius);
  height: 16px;
`

const ProgressBar = styled.span<{ percentage: number }>`
  background-color: ${(props) =>
    props.percentage <= 50
      ? ({ theme }) => theme.colors.secondary
      : ({ theme }) => theme.colors.success};
  border-radius: var(--border-radius);
  display: block;
  height: 100%;
  overflow: hidden;
  transition: all 0.5s ease-in-out;
  width: ${(props) => props.percentage}%;
`

const BottomInfo = styled.div`
  align-items: start;
  border-top: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  display: flex;
  flex-direction: column;
  font-size: 1.4rem;
  font-weight: 300;
  gap: calc(var(--theme-common-space) / 2);
  justify-content: space-between;
  margin-top: calc(var(--theme-common-space) * 5);
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 3) 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`

const EstimatedTime = styled.span`
  color: ${({ theme: { colors } }) => colors.textColor};
`

const MonitorBlocksLink = styled.a`
  color: ${({ theme: { colors } }) => colors.darkGrey};
  cursor: pointer;
  display: flex;
  gap: 8px;
  text-decoration: none;

  svg {
    max-width: 14px;

    .stroke {
      stroke: ${({ theme: { colors } }) => colors.darkGrey};
    }
  }

  &:hover {
    color: ${({ theme: { colors } }) => colors.primary};

    svg {
      .stroke {
        stroke: ${({ theme: { colors } }) => colors.primary};
      }
    }
  }
`

interface Props {
  isNativeBridge: boolean
  network: ChainsKeys
  transactionHash: string
}

export const BlockConfirmations: React.FC<Props> = ({
  isNativeBridge,
  network,
  transactionHash,
  ...restProps
}) => {
  const { getExplorerUrl } = useWeb3Connection()
  const chainId = Chains[network]
  const { progressData } = useBridgeProgress(chainId, isNativeBridge, transactionHash)
  const percentage = progressData?.progress || 0
  const sanitizedPercentage = percentage < 0 ? 0 : percentage > 100 ? 100 : percentage || 0
  const estimatedTimeInSeconds = progressData?.estimatedTimeInSeconds || 0
  const requiredBlocks = progressData?.requiredBlocks || 0
  const confirmations = progressData?.confirmations || 0
  const { blockExplorerName } = getNetworkConfig(chainId)

  return (
    <Wrapper {...restProps}>
      <Title>Waiting for block confirmation</Title>
      <TopInfo>
        <BlocksInformation>
          <Completed>
            <Percentage>{sanitizedPercentage}%</Percentage> complete
          </Completed>
          <CompletedBlocks>
            {confirmations} of {requiredBlocks} blocks required
          </CompletedBlocks>
        </BlocksInformation>
        <Progress>
          <ProgressBar percentage={sanitizedPercentage || 0} />
        </Progress>
      </TopInfo>
      <BottomInfo>
        <EstimatedTime>
          Estimated time{' '}
          {formatDistance(0, estimatedTimeInSeconds * 1000, {
            includeSeconds: true,
          })}
        </EstimatedTime>
        <MonitorBlocksLink
          href={getExplorerUrl(transactionHash, network)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Magnifier /> Monitor at {blockExplorerName} {shortenAddress(transactionHash)}
        </MonitorBlocksLink>
      </BottomInfo>
    </Wrapper>
  )
}
