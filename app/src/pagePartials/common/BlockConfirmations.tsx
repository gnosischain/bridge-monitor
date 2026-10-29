import styled from 'styled-components'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'
import { Magnifier } from '@/src/components/assets/Magnifier'
import { shortenAddress } from '@/src/utils/tools'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Chains, ChainsKeys } from '@/src/constants/config/types'
import useBridgeProgress from '@/src/hooks/bridge/useBridgeProgress'
import { txTime } from '@/src/utils/txTime'
import { getNetworkConfig } from '@/src/constants/config/chains'

const Wrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 2.5) 0 calc(var(--theme-common-space) * 2);
`

const Title = styled.h3`
  ${EyebrowCSS}
  margin: 0 0 calc(var(--theme-common-space) * 1.5);
  padding: 0 calc(var(--theme-common-space) * 2.5);
`

const TopInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 1.5);
  padding: 0 calc(var(--theme-common-space) * 2.5);
`

const BlocksInformation = styled.div`
  align-items: end;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px calc(var(--theme-common-space) * 2);
  justify-content: space-between;
`

const Completed = styled.h5`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const Percentage = styled.span`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 2.8rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: -0.02em;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 3.2rem;
  }
`

const CompletedBlocks = styled.span`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
`

const Progress = styled.div`
  --border-radius: 999px;

  background-color: ${({ theme: { colors } }) => colors.line};
  border-radius: var(--border-radius);
  height: 8px;
  overflow: hidden;
`

const ProgressBar = styled.span.withConfig({
  shouldForwardProp: (prop) => !['percentage'].includes(prop),
})<{ percentage: number }>`
  background-color: ${(props) =>
    props.percentage < 100
      ? ({ theme }) => theme.colors.violet
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
  border-top: 1px solid ${({ theme: { colors } }) => colors.line};
  color: ${({ theme: { colors } }) => colors.fog};
  display: flex;
  flex-direction: column;
  font-size: 1.3rem;
  font-weight: 400;
  gap: calc(var(--theme-common-space) / 2);
  justify-content: space-between;
  margin-top: calc(var(--theme-common-space) * 2.5);
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 2.5) 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`

const EstimatedTime = styled.span`
  color: ${({ theme: { colors } }) => colors.fog};
`

const MonitorBlocksLink = styled.a`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  cursor: pointer;
  display: flex;
  gap: 6px;
  text-decoration: none;

  svg {
    max-width: 14px;

    .stroke {
      stroke: currentColor;
    }
  }

  &:hover {
    color: ${({ theme: { colors } }) => colors.ink};
  }
`

interface Props {
  network: ChainsKeys
  transactionHash: string
}

export const BlockConfirmations: React.FC<Props> = ({ network, transactionHash, ...restProps }) => {
  const { getExplorerUrl } = useWeb3Connection()
  const chainId = Chains[network]
  const { progressData } = useBridgeProgress(chainId, transactionHash)
  const percentage = progressData?.progress || 0
  const sanitizedPercentage = percentage < 0 ? 0 : percentage > 100 ? 100 : percentage || 0
  const requiredBlocks = progressData?.requiredBlocks || 0
  const confirmations = progressData?.confirmations || 0
  const { blockExplorerName } = getNetworkConfig(chainId)

  return (
    <Wrapper {...restProps}>
      <Title>Block confirmations</Title>
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
        <EstimatedTime>Estimated time {txTime(network)}</EstimatedTime>
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
