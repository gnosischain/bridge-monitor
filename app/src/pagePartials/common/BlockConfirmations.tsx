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
  box-shadow: 0px 2.231px 2.775px 0px rgba(0, 0, 0, 0.01), 0px 10.2px 7.8px 0px rgba(0, 0, 0, 0.01),
    0px 25.819px 20.925px 0px rgba(0, 0, 0, 0.02), 0px 51px 48px 0px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 5) 0 calc(var(--theme-common-space) * 3);
`
const Title = styled.h3`
  font-size: 1.8rem;
  margin: 0 0 calc(var(--theme-common-space) * 3);
  font-weight: 400;
  padding: 0 calc(var(--theme-common-space) * 3);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 2.1rem;
  }
`
const BlocksInformation = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
`
const Completed = styled.h5`
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  strong {
    font-size: 2.6rem;
    @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
      font-size: 3.2rem;
    }
  }
`
const BlocksCounter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 calc(var(--theme-common-space) * 3);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    gap: 16px;
  }
`
const LoadBar = styled.div<{ percentage: number }>`
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  span {
    transition: all 1s ease-in-out;
    width: ${(props) => props.percentage}%;
    display: block;
    border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
    height: 16px;
    background-color: ${(props) =>
      props.percentage <= 50
        ? ({ theme }) => theme.colors.secondary
        : ({ theme }) => theme.colors.success};
  }
`
const Information = styled.div`
  font-size: 1.4rem;
  font-weight: 300;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  gap: calc(var(--theme-common-space) / 2);
  margin-top: calc(var(--theme-common-space) * 5);
  border-top: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 3) 0;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`
const MonitorBlocksLink = styled.a`
  display: flex;
  gap: 8px;
  cursor: pointer;
  color: ${({ theme: { colors } }) => colors.darkGrey};
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
  transactionHash: string
  network: ChainsKeys
  isNativeBridge: boolean
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
  const estimatedTimeInSeconds = progressData?.estimatedTimeInSeconds || 0
  const requiredBlocks = progressData?.requiredBlocks || 0
  const confirmations = progressData?.confirmations || 0

  const { blockExplorerName } = getNetworkConfig(chainId)

  return (
    <Wrapper {...restProps}>
      <Title>Waiting for block confirmation</Title>
      <BlocksCounter>
        <BlocksInformation>
          <Completed>
            <strong>{percentage}%</strong> complete
          </Completed>
          <span>
            {confirmations}/{requiredBlocks} blocks
          </span>
        </BlocksInformation>
        <LoadBar percentage={percentage || 0}>
          <span></span>
        </LoadBar>
      </BlocksCounter>
      <Information>
        <span>
          Estimated time{' '}
          {formatDistance(0, estimatedTimeInSeconds * 1000, {
            includeSeconds: true,
          })}
        </span>
        <MonitorBlocksLink
          href={getExplorerUrl(transactionHash, network)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Magnifier /> Monitor at {blockExplorerName} {shortenAddress(transactionHash)}
        </MonitorBlocksLink>
      </Information>
    </Wrapper>
  )
}
