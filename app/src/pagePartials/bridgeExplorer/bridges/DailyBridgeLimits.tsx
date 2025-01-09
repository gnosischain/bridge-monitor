import styled from 'styled-components'
import { PropsWithChildren, useState } from 'react'
import { BridgeLimit } from '@/src/pagePartials/bridgeExplorer/bridges/BridgeLimit'
import { BaseSubTitle } from '@/src/components/text/BaseSubTitle'
import { Chains } from '@/src/constants/config/chains'
import { Token } from '@/types/token'
import {
  useForeignOMNIBridgeLimits,
  useHomeOMNIBridgeLimits,
} from '@/src/hooks/contracts/useOMNIContractCalls'
import {
  useForeignXDAIBridgeLimits,
  useHomeXDAIBridgeLimits,
} from '@/src/hooks/contracts/useXDAIContractCalls'
import { useGnoToken } from '@/src/hooks/useGnoToken'
import { useDaiToken } from '@/src/hooks/useDaiToken'
import { useDayNumber } from '@/src/hooks/useDayNumber'
import { genericSuspense } from '@/src/components/safeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { TokenDropdown } from '@/src/pagePartials/bridgeExplorer/bridges/TokenDropdown'
import { InnerCard } from '@/src/components/card/InnerCard'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { ArrowRight } from '@/src/components/assets/ArrowRight'

const Columns = styled.div`
  display: grid;
  gap: calc(var(--theme-common-space) * 2);
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Row = styled.div``

const Title = styled(BaseSubTitle)`
  display: flex;
  column-gap: 20px;
  align-items: center;
  margin-bottom: 10px;
`

const InvalidToken = styled(InnerCard)`
  align-items: center;
  display: flex;
  flex-direction: column;
  grid-column: auto / span 2;
  justify-content: center;
  min-height: 350px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    margin: 0 auto;
    max-width: 400px;
  }
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.8rem;
  font-weight: 400;
  margin: 0;
  text-align: center;
`

const TitleWrapper = styled.span`
  align-items: center;
  column-gap: 8px;
  display: flex;
  flex-direction: row;
  row-gap: 8px;
`

const Placeholder: React.FC = () => (
  <SkeletonLoading
    style={{
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      rowGap: '16px',
    }}
  >
    <SkeletonLoading
      $animate={false}
      style={{
        height: '34px',
        marginBottom: '8px',
      }}
    />
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading $animate={false} key={index} style={{ height: '95px' }} />
    ))}
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading $animate={false} key={index} style={{ height: '70px' }} />
    ))}
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading $animate={false} key={index} style={{ minHeight: '0', height: '17px' }} />
    ))}
  </SkeletonLoading>
)

export const XDAIEthToGC: React.FC<{ dayNumber: string | undefined }> = genericSuspense(
  ({ dayNumber }) => {
    const { foreignXdaiInformation } = useForeignXDAIBridgeLimits(dayNumber)
    const { mainnetDaiToken } = useDaiToken()

    return (
      <BridgeLimit
        chainId={Chains.mainnet}
        from="Ethereum"
        networkName="mainnet"
        title={
          <TitleWrapper>
            Ethereum Mainnet
            <ArrowRight />
            Gnosis Chain
          </TitleWrapper>
        }
        to="Gnosis"
        token={mainnetDaiToken}
        {...foreignXdaiInformation}
      />
    )
  },
  () => <Placeholder />,
)

export const XDAIGCToEth: React.FC<{ dayNumber: string | undefined }> = genericSuspense(
  ({ dayNumber }) => {
    const { homeXdaiInformation } = useHomeXDAIBridgeLimits(dayNumber)
    const { gnosisXdaiToken } = useDaiToken()

    return (
      <BridgeLimit
        chainId={Chains.gnosis}
        from="Gnosis"
        isNativeToken
        networkName="gnosis"
        title={
          <TitleWrapper>
            Gnosis Chain
            <ArrowRight />
            Ethereum Mainnet
          </TitleWrapper>
        }
        to="Ethereum"
        token={gnosisXdaiToken}
        tokenTooltip="xDAI tokens are native to Gnosis and enable payments for smart contract execution and gas fees."
        {...homeXdaiInformation}
      />
    )
  },
  () => <Placeholder />,
)

const OmnibridgeMainnetToGnosisChain: React.FC<{ token: Token; dayNumber: string | undefined }> =
  genericSuspense(
    ({ dayNumber, token }) => {
      const { foreignOmniInformation } = useForeignOMNIBridgeLimits(token, dayNumber)

      return (
        <BridgeLimit
          chainId={Chains.mainnet}
          from="Ethereum"
          networkName="mainnet"
          title={
            <TitleWrapper>
              Ethereum Mainnet
              <ArrowRight />
              Gnosis Chain
            </TitleWrapper>
          }
          to="Gnosis"
          token={token}
          {...foreignOmniInformation}
        />
      )
    },
    () => <Placeholder />,
  )

const OmnibridgeGnosisChainToMainnet: React.FC<{ token: Token; dayNumber: string | undefined }> =
  genericSuspense(
    ({ dayNumber, token }) => {
      const { homeOmniInformation } = useHomeOMNIBridgeLimits(token, dayNumber)

      return (
        <BridgeLimit
          chainId={Chains.gnosis}
          from="Gnosis"
          networkName="gnosis"
          title={
            <TitleWrapper>
              Gnosis Chain
              <ArrowRight />
              Ethereum Mainnet
            </TitleWrapper>
          }
          to="Ethereum"
          token={token}
          {...homeOmniInformation}
        />
      )
    },
    () => <Placeholder />,
  )

const XDAITitle: React.FC = () => <Title>xDai</Title>
const OmnibridgeTitle: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
  <Title>Omnibridge{children}</Title>
)

const Limits: React.FC = () => {
  const dayNumber = useDayNumber()
  const { gnosisGnoToken, mainnetGnoToken } = useGnoToken()
  const [mainnetToGnosisChainToken, setMainnetToGnosisChainToken] = useState<Token>(mainnetGnoToken)
  const [gnosisChainToMainnet, setGnosisChainToMainnet] = useState<Token>(gnosisGnoToken)
  const [invalidToken, setInvalidToken] = useState<Token | false>(false)
  const { tokensByAddress } = useBridgedTokens()

  const onChangeToken = (token: Token) => {
    // the list of tokens used are those of Mainnet (foreign network)
    const mainnetToGnosisChain = token
    const otherSideAddress = token.extensions.bridgeInfo[Chains.gnosis]?.tokenAddress.toLowerCase()
    if (!otherSideAddress) throw new Error('Token address not found')
    const gnosisChainToMainnet = tokensByAddress[otherSideAddress] ?? {
      address: token.extensions.bridgeInfo[Chains.gnosis]?.tokenAddress,
      chainId: Chains.gnosis,
      decimals: 18,
      extensions: token.extensions,
      logoURI: '',
      name: 'Safe Token',
      symbol: 'SAFE',
    }

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
    <>
      <Row>
        <XDAITitle />
        <Columns>
          <XDAIEthToGC dayNumber={dayNumber} />
          <XDAIGCToEth dayNumber={dayNumber} />
        </Columns>
      </Row>
      <Row>
        <OmnibridgeTitle>
          <TokenDropdown
            chainId={Chains.mainnet}
            defaultToken={mainnetToGnosisChainToken}
            onChange={onChangeToken}
          />
        </OmnibridgeTitle>
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
    </>
  )
}

export const DailyBridgeLimits: React.FC = genericSuspense(
  () => {
    return <Limits />
  },
  () => (
    <>
      <Row>
        <XDAITitle />
        <Columns>
          <Placeholder />
          <Placeholder />
        </Columns>
      </Row>
      <Row>
        <OmnibridgeTitle />
        <Columns>
          <Placeholder />
          <Placeholder />
        </Columns>
      </Row>
    </>
  ),
)
