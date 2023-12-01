import { useState } from 'react'
import { BridgeLimit } from '@/src/pagePartials/bridges/BridgeLimit'
import { TabContentInner as Wrapper } from '@/src/components/tabs/Tabs'
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
import styled from 'styled-components'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { TokenDropdown } from '@/src/components/token/TokenDropdown'
import { InnerCard } from '@/src/components/common/InnerCard'
import { useBridgedTokens } from '@/src/providers/TokenListProvider'
import { TokenIcon } from '@/src/components/token/TokenIcon'

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

export const XDAIEthToGC: React.FC<{ dayNumber: string | undefined }> = genericSuspense(
  ({ dayNumber, ...restProps }) => {
    const { foreignXdaiInformation } = useForeignXDAIBridgeLimits(dayNumber)
    const { mainnetDaiToken } = useDaiToken()

    return (
      <BridgeLimit
        chainId={Chains.mainnet}
        disableTokenDropdown
        from="Ethereum"
        networkName="mainnet"
        title="Ethereum Mainnet -> GC"
        to="Gnosis"
        token={mainnetDaiToken}
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
    const { gnosisXdaiToken } = useDaiToken()

    return (
      <BridgeLimit
        chainId={Chains.gnosis}
        disableTokenDropdown
        from="Gnosis"
        isNativeToken
        networkName="gnosis"
        title="GC -> Ethereum Mainnet"
        to="Ethereum"
        token={gnosisXdaiToken}
        tokenTooltip="xDAI tokens are native to Gnosis and enable payments for smart contract execution and gas fees."
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
          networkName="mainnet"
          title="Ethereum Mainnet -> GC"
          to="Gnosis"
          token={token}
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
          networkName="gnosis"
          title="GC -> Ethereum Mainnet"
          to="Ethereum"
          token={token}
          {...homeOmniInformation}
          {...restProps}
        />
      )
    },
    () => <Placeholder />,
  )

export const DailyBridgeLimits: React.FC = ({ ...restProps }) => {
  const dayNumber = useDayNumber()
  const { gnosisGnoToken, mainnetGnoToken } = useGnoToken()
  const [mainnetToGnosisChainToken, setMainnetToGnosisChainToken] = useState<Token>(mainnetGnoToken)
  const [gnosisChainToMainnet, setGnosisChainToMainnet] = useState<Token>(gnosisGnoToken)
  const [invalidToken, setInvalidToken] = useState<Token | false>(false)
  const { tokensByAddress } = useBridgedTokens()

  const onChangeToken = (token: Token) => {
    // the list of tokens used are those of Mainnet (foreign network)
    const mainnetToGnosisChain = token
    const gnosisChainToMainnet =
      tokensByAddress[token.extensions.bridgeInfo[Chains.gnosis].tokenAddress.toLowerCase()]

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
