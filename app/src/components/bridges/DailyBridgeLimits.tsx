import { BridgeLimit } from '@/src/components/limits/BridgeLimit'
import { TabContentInner } from '@/src/components/tabs/TabContentInner'
import { BaseSubTitle } from '@/src/components/text/BaseSubTitle'
import { Chains, chainsConfig } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { Token, tokens } from '@/src/constants/token'
import {
  useForeignOMNIBridgeLimits,
  useHomeOMNIBridgeLimits,
} from '@/src/hooks/contracts/useOMNIContractCalls'
import {
  useForeignXDAIBridgeLimits,
  useHomeXDAIBridgeLimits,
} from '@/src/hooks/contracts/useXDAIContractCalls'
import { useDayNumber } from '@/src/hooks/useDayNumber'
import { useState } from 'react'
import styled from 'styled-components'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

const Wrapper = styled(TabContentInner)``

const Columns = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Row = styled.div``

const Placeholder: React.FC = () => (
  <SkeletonLoading
    animate={false}
    style={{
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      rowGap: '16px',
    }}
  >
    <SkeletonLoading
      style={{
        height: '34px',
        marginBottom: '8px',
      }}
    />
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading key={index} style={{ height: '95px' }} />
    ))}
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading key={index} style={{ height: '70px' }} />
    ))}
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading key={index} style={{ minHeight: '0', height: '17px' }} />
    ))}
  </SkeletonLoading>
)

const MAINNET = 'mainnet'

const getExplorerUrlForAddress = (network: string, address: string) => {
  const chain = network === MAINNET ? Chains.mainnet : Chains.gnosis
  return `${chainsConfig[chain].blockExplorerUrls[0]}address/${address}`
}

export const XDAIEthToGC: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const dayNumber = useDayNumber()
    const { foreignXdaiInformation } = useForeignXDAIBridgeLimits(dayNumber)

    return (
      <BridgeLimit
        chainId={Chains.mainnet}
        defaultToken={tokens.DAI}
        disableTokenDropdown
        from="Ethereum"
        title="Ethereum Mainnet -> GC"
        to="Gnosis"
        url={getExplorerUrlForAddress('mainnet', contracts.XDAI.address[Chains.mainnet])}
        {...foreignXdaiInformation}
        {...restProps}
      />
    )
  },
  () => <Placeholder />,
)

export const XDAIGCToEth: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const dayNumber = useDayNumber()
    const { homeXdaiInformation } = useHomeXDAIBridgeLimits(dayNumber)

    return (
      <BridgeLimit
        chainId={Chains.gnosis}
        defaultToken={tokens.XDAI}
        disableTokenDropdown
        from="Gnosis"
        title="GC -> Ethereum Mainnet"
        to="Ethereum"
        url={getExplorerUrlForAddress('gnosis', contracts.XDAI.address[Chains.gnosis])}
        {...homeXdaiInformation}
        {...restProps}
      />
    )
  },
  () => <Placeholder />,
)

const OmnibridgeEthToGC: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const dayNumber = useDayNumber()
    const [mainnetToken, setMainnetToken] = useState<Token>(tokens.GNO)
    const { foreignOmniInformation } = useForeignOMNIBridgeLimits(mainnetToken, dayNumber)

    return (
      <BridgeLimit
        chainId={Chains.mainnet}
        defaultToken={tokens.GNO}
        from="Ethereum"
        onTokenChange={setMainnetToken}
        title="Ethereum Mainnet -> GC"
        to="Gnosis"
        url={getExplorerUrlForAddress('mainnet', contracts.OMNI.address[Chains.mainnet])}
        {...foreignOmniInformation}
        {...restProps}
      />
    )
  },
  () => <Placeholder />,
)

const OmnibridgeGCToEth: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const dayNumber = useDayNumber()
    const [gnosisToken, setGnosisToken] = useState<Token>(tokens.GNO_GC)
    const { homeOmniInformation } = useHomeOMNIBridgeLimits(gnosisToken, dayNumber)

    return (
      <BridgeLimit
        chainId={Chains.gnosis}
        defaultToken={tokens.GNO_GC}
        from="Gnosis"
        onTokenChange={setGnosisToken}
        title="GC -> Ethereum Mainnet"
        to="Ethereum"
        url={getExplorerUrlForAddress('gnosis', contracts.OMNI.address[Chains.gnosis])}
        {...homeOmniInformation}
        {...restProps}
      />
    )
  },
  () => <Placeholder />,
)

export const DailyBridgeLimits: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Row>
        <BaseSubTitle>xDai</BaseSubTitle>
        <Columns>
          <XDAIEthToGC />
          <XDAIGCToEth />
        </Columns>
      </Row>
      <Row>
        <BaseSubTitle>Omnibridge</BaseSubTitle>
        <Columns>
          <OmnibridgeEthToGC />
          <OmnibridgeGCToEth />
        </Columns>
      </Row>
    </Wrapper>
  )
}
