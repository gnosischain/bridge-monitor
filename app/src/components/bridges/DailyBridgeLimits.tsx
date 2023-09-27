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

const Wrapper = styled(TabContentInner)``

const Columns = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`
const MAINNET = 'mainnet'

const getExplorerUrlForAddress = (network: string, address: string) => {
  const chain = network === MAINNET ? Chains.mainnet : Chains.gnosis
  return `${chainsConfig[chain].blockExplorerUrls[0]}address/${address}`
}

export const DailyBridgeLimits: React.FC = ({ ...restProps }) => {
  const dayNumber = useDayNumber()

  // XDAI
  const { foreignXdaiInformation } = useForeignXDAIBridgeLimits(dayNumber)
  const { homeXdaiInformation } = useHomeXDAIBridgeLimits(dayNumber)

  // OMNI
  const [mainnetToken, setMainnetToken] = useState<Token>(tokens.GNO)
  const [gnosisToken, setGnosisToken] = useState<Token>(tokens.GNO_GC)
  const { foreignOmniInformation } = useForeignOMNIBridgeLimits(mainnetToken, dayNumber)
  const { homeOmniInformation } = useHomeOMNIBridgeLimits(gnosisToken, dayNumber)

  return (
    <Wrapper {...restProps}>
      <div>
        <BaseSubTitle>xDai</BaseSubTitle>
        <Columns>
          <BridgeLimit
            bridgeReset={1667054970000}
            chainId={Chains.mainnet}
            defaultToken={tokens.DAI}
            disableTokenDropdown
            from="Ethereum"
            title="Ethereum Mainnet -> GC"
            to="Gnosis"
            url={getExplorerUrlForAddress('mainnet', contracts.XDAI.address[Chains.mainnet])}
            {...foreignXdaiInformation}
          />
          <BridgeLimit
            bridgeReset={1666442910000}
            chainId={Chains.gnosis}
            defaultToken={tokens.XDAI}
            disableTokenDropdown
            from="Gnosis"
            title="GC -> Ethereum Mainnet"
            to="Ethereum"
            url={getExplorerUrlForAddress('gnosis', contracts.XDAI.address[Chains.gnosis])}
            {...homeXdaiInformation}
          />
        </Columns>
      </div>
      <div>
        <BaseSubTitle>Omnibridge</BaseSubTitle>
        <Columns>
          <BridgeLimit
            bridgeReset={1666882170000}
            chainId={Chains.mainnet}
            defaultToken={tokens.GNO}
            from="Ethereum"
            onTokenChange={setMainnetToken}
            title="Ethereum Mainnet -> GC"
            to="Gnosis"
            url={getExplorerUrlForAddress('mainnet', contracts.OMNI.address[Chains.mainnet])}
            {...foreignOmniInformation}
          />
          <BridgeLimit
            bridgeReset={1666450170000}
            chainId={Chains.gnosis}
            defaultToken={tokens.GNO_GC}
            from="Gnosis"
            onTokenChange={setGnosisToken}
            title="GC -> Ethereum Mainnet"
            to="Ethereum"
            url={getExplorerUrlForAddress('gnosis', contracts.OMNI.address[Chains.gnosis])}
            {...homeOmniInformation}
          />
        </Columns>
      </div>
    </Wrapper>
  )
}
