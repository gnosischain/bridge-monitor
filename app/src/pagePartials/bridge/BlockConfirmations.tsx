import styled from 'styled-components'
import { Magnifier } from '@/src/components/assets/Magnifier'
import { shortenAddress } from '@/src/utils/tools'

const Wrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 16px;
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
  border-radius: 16px;
  span {
    transition: all 1s ease-in-out;
    width: ${(props) => props.percentage}%;
    display: block;
    border-radius: 16px;
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
  address: string
  time: string
  percentage: number
}

export const BlockConfirmations: React.FC<Props> = ({
  address,
  percentage,
  time,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Title>Waiting for block confirmations</Title>
      <BlocksCounter>
        <BlocksInformation>
          <Completed>
            <strong>{percentage}%</strong> complete
          </Completed>
          <span>{percentage}/100</span>
        </BlocksInformation>
        <LoadBar percentage={percentage}>
          <span></span>
        </LoadBar>
      </BlocksCounter>
      <Information>
        <span>Estimated time {time}</span>
        {/*TODO: we should link the user to the correspondent blockscan. Etherscan if Mainnet, GnosisScan if Gnosis Chain.  */}
        <MonitorBlocksLink href="/" rel="noopener noreferrer" target="_blank">
          <Magnifier /> Monitor at GnosisScan {shortenAddress(address)}
        </MonitorBlocksLink>
      </Information>
    </Wrapper>
  )
}
