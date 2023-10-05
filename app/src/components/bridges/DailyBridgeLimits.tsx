import { useState } from 'react'
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
import styled from 'styled-components'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { TokenDropdown } from '@/src/components/token/TokenDropdown'
import { InnerCard } from '@/src/components/common/InnerCard'
import { useTokenIcons } from '@/src/providers/tokenIconsProvider'
import { TokenIcon } from '@/src/components/token/TokenIcon'

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

const Title = styled(BaseSubTitle)`
  display: flex;
  column-gap: 20px;
  align-items: center;
`

const InvalidToken = styled(InnerCard)`
  align-items: center;
  display: flex;
  flex-direction: column;
  grid-column: auto / span 2;
  justify-content: center;
  min-height: 350px;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin: 0 auto;
    max-width: 400px;
  }
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.white};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.8rem;
  font-weight: 400;
  margin: 0;

  text-align: center;
`

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

export const XDAIEthToGC: React.FC<{ dayNumber: string | undefined }> = genericSuspense(
  ({ dayNumber, ...restProps }) => {
    const { foreignXdaiInformation } = useForeignXDAIBridgeLimits(dayNumber)

    return (
      <BridgeLimit
        chainId={Chains.mainnet}
        disableTokenDropdown
        from="Ethereum"
        title="Ethereum Mainnet -> GC"
        to="Gnosis"
        token={tokens.DAI}
        url={getExplorerUrlForAddress('mainnet', contracts.XDAI.address[Chains.mainnet])}
        {...foreignXdaiInformation}
        {...restProps}
      />
    )
  },
  () => <Placeholder />,
)

export const XDAIGCToEth: React.FC<{ dayNumber: string | undefined }> = genericSuspense(
  ({ dayNumber, ...restProps }) => {
    const { homeXdaiInformation } = useHomeXDAIBridgeLimits(dayNumber)

    return (
      <BridgeLimit
        chainId={Chains.gnosis}
        disableTokenDropdown
        from="Gnosis"
        title="GC -> Ethereum Mainnet"
        to="Ethereum"
        token={tokens.XDAI}
        url={getExplorerUrlForAddress('gnosis', contracts.XDAI.address[Chains.gnosis])}
        {...homeXdaiInformation}
        {...restProps}
      />
    )
  },
  () => <Placeholder />,
)

const OmnibridgeMainnetToGnosisChain: React.FC<{ token: Token; dayNumber: string | undefined }> =
  genericSuspense(
    ({ dayNumber, token, ...restProps }) => {
      const { foreignOmniInformation } = useForeignOMNIBridgeLimits(token, dayNumber)

      return (
        <BridgeLimit
          chainId={Chains.mainnet}
          from="Ethereum"
          title="Ethereum Mainnet -> GC"
          to="Gnosis"
          token={token}
          url={getExplorerUrlForAddress('mainnet', contracts.OMNI.address[Chains.mainnet])}
          {...foreignOmniInformation}
          {...restProps}
        />
      )
    },
    () => <Placeholder />,
  )

const OmnibridgeGnosisChainToMainnet: React.FC<{ token: Token; dayNumber: string | undefined }> =
  genericSuspense(
    ({ dayNumber, token, ...restProps }) => {
      const { homeOmniInformation } = useHomeOMNIBridgeLimits(token, dayNumber)

      return (
        <BridgeLimit
          chainId={Chains.gnosis}
          from="Gnosis"
          title="GC -> Ethereum Mainnet"
          to="Ethereum"
          token={token}
          url={getExplorerUrlForAddress('gnosis', contracts.OMNI.address[Chains.gnosis])}
          {...homeOmniInformation}
          {...restProps}
        />
      )
    },
    () => <Placeholder />,
  )

export const DailyBridgeLimits: React.FC = ({ ...restProps }) => {
  const dayNumber = useDayNumber()
  const [mainnetToGnosisChainToken, setMainnetToGnosisChainToken] = useState<Token>(tokens.GNO)
  const [gnosisChainToMainnet, setGnosisChainToMainnet] = useState<Token>(tokens.GNO_GC)
  const [invalidToken, setInvalidToken] = useState<Token | false>(false)
  const { tokensByNetwork } = useTokenIcons()
  const mainnetTokens = tokensByNetwork[Chains.mainnet] || []
  const gnosisTokens = tokensByNetwork[Chains.gnosis] || []

  const onChangeToken = (token: Token) => {
    const mainnetToGnosisChain = mainnetTokens.find(
      (item) => item.symbol.toLowerCase() === token.symbol.toLowerCase(),
    )
    const gnosisChainToMainnet = gnosisTokens.find(
      (item) => item.symbol.toLowerCase() === token.symbol.toLowerCase(),
    )
    const isSelectedTokenValid = mainnetToGnosisChain && gnosisChainToMainnet

    if (isSelectedTokenValid) {
      setInvalidToken(false)
      setMainnetToGnosisChainToken(mainnetToGnosisChain)
      setGnosisChainToMainnet(gnosisChainToMainnet)
    } else {
      setInvalidToken(token)
      console.error('Invalid token selected')
    }
  }

  return (
    <Wrapper {...restProps}>
      <Row>
        <Title>xDai</Title>
        <Columns>
          <XDAIEthToGC dayNumber={dayNumber} />
          <XDAIGCToEth dayNumber={dayNumber} />
        </Columns>
      </Row>
      <Row>
        <Title>
          Omnibridge
          <TokenDropdown
            chainId={Chains.mainnet}
            defaultToken={mainnetToGnosisChainToken}
            onChange={onChangeToken}
          />
        </Title>
        <Columns>
          {invalidToken ? (
            <InvalidToken>
              <Title style={{ marginBottom: '10px' }}>Invalid token</Title>
              <TokenIcon
                dimensions={50}
                iconSource={invalidToken.logoURI}
                symbol={invalidToken.symbol}
              />
              <Text>
                The selected token <b>({invalidToken.symbol.toUpperCase()})</b> doesn't have a{' '}
                <b>Gnosis Chain</b> equivalent.
              </Text>
              <Text>
                <b>Omnibridge</b> will automatically create one once you or someone else bridges it.
              </Text>
            </InvalidToken>
          ) : (
            <>
              <OmnibridgeMainnetToGnosisChain
                dayNumber={dayNumber}
                token={mainnetToGnosisChainToken}
              />
              <OmnibridgeGnosisChainToMainnet dayNumber={dayNumber} token={gnosisChainToMainnet} />
            </>
          )}
        </Columns>
      </Row>
    </Wrapper>
  )
}
