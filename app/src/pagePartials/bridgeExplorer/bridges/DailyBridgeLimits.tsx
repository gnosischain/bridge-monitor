import styled from 'styled-components'
import { useState } from 'react'
import { zeroAddress } from 'viem'
import { BridgeLimit } from '@/src/pagePartials/bridgeExplorer/bridges/BridgeLimit'
import { Card } from '@/src/pagePartials/bridgeExplorer/bridges/Card'
import { SectionHeader } from '@/src/components/sectionHeader'
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
import { genericSuspense } from '@/src/components/safeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { TokenDropdown } from '@/src/pagePartials/bridgeExplorer/bridges/TokenDropdown'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { usdsToken } from '@/src/constants/usdsToken'

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 5);
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
`

const Columns = styled.div`
  display: grid;
  gap: calc(var(--theme-common-space) * 2);
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const InvalidToken = styled(Card)`
  align-items: center;
  grid-column: 1 / -1;
  padding: calc(var(--theme-common-space) * 5) calc(var(--theme-common-space) * 3);
  row-gap: calc(var(--theme-common-space) * 1.5);
  text-align: center;
`

const InvalidTokenTitle = styled.h3`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.3;
  margin: var(--theme-common-space) 0 0;
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  line-height: 1.5;
  margin: 0;
  max-width: 420px;

  b {
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 600;
  }
`

const Placeholder: React.FC = () => (
  <Card aria-hidden>
    <SkeletonLoading style={{ height: '32px', maxWidth: '260px' }} />
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading key={index} style={{ height: '50px' }} />
    ))}
    <SkeletonLoading style={{ height: '220px' }} />
  </Card>
)

export const XDAIEthToGC: React.FC = genericSuspense(
  () => {
    const { foreignXdaiInformation, isLoading } = useForeignXDAIBridgeLimits()

    if (isLoading) return <Placeholder />

    return (
      <BridgeLimit
        from="Ethereum"
        networkName="mainnet"
        to="Gnosis Chain"
        token={usdsToken}
        {...foreignXdaiInformation}
      />
    )
  },
  () => <Placeholder />,
)

export const XDAIGCToEth: React.FC = genericSuspense(
  () => {
    const { homeXdaiInformation, isLoading } = useHomeXDAIBridgeLimits()
    const { gnosisXdaiToken } = useDaiToken()

    if (isLoading) return <Placeholder />

    return (
      <BridgeLimit
        from="Gnosis Chain"
        isNativeToken
        networkName="gnosis"
        to="Ethereum"
        token={gnosisXdaiToken}
        tokenTooltip="xDAI tokens are native to Gnosis and enable payments for smart contract execution and gas fees."
        {...homeXdaiInformation}
      />
    )
  },
  () => <Placeholder />,
)

const OmnibridgeMainnetToGnosisChain: React.FC<{ token: Token }> = genericSuspense(
  ({ token }) => {
    const { foreignOmniInformation, isLoading } = useForeignOMNIBridgeLimits(token)

    if (isLoading) return <Placeholder />

    return (
      <BridgeLimit
        from="Ethereum"
        networkName="mainnet"
        to="Gnosis Chain"
        token={token}
        {...foreignOmniInformation}
      />
    )
  },
  () => <Placeholder />,
)

const OmnibridgeGnosisChainToMainnet: React.FC<{ token: Token }> = genericSuspense(
  ({ token }) => {
    const { homeOmniInformation, isLoading } = useHomeOMNIBridgeLimits(token)

    if (isLoading) return <Placeholder />

    return (
      <BridgeLimit
        from="Gnosis Chain"
        networkName="gnosis"
        to="Ethereum"
        token={token}
        {...homeOmniInformation}
      />
    )
  },
  () => <Placeholder />,
)

const XDAIHeader: React.FC = () => <SectionHeader title="xDai bridge" />
const OmnibridgeHeader: React.FC<{ aside?: React.ReactNode }> = ({ aside }) => (
  <SectionHeader aside={aside} title="Omnibridge" />
)

const Limits: React.FC = () => {
  const { gnosisGnoToken, mainnetGnoToken } = useGnoToken()
  const [mainnetToGnosisChainToken, setMainnetToGnosisChainToken] = useState<Token>(mainnetGnoToken)
  const [gnosisChainToMainnet, setGnosisChainToMainnet] = useState<Token>(gnosisGnoToken)
  const [invalidToken, setInvalidToken] = useState<Token | false>(false)
  const { tokensByAddress } = useBridgedTokens()

  const onChangeToken = (token: Token) => {
    // the list of tokens used are those of Mainnet (foreign network). Set even when invalid: the
    // dropdown shows this token, not its own pick.
    setMainnetToGnosisChainToken(token)

    // The dropdown's address search finds tokens outside the list: the zero address means nobody
    // has bridged it yet, otherwise its Gnosis side has the same symbol and decimals.
    const otherSideAddress = token.extensions.bridgeInfo[Chains.gnosis]?.tokenAddress.toLowerCase()
    if (!otherSideAddress || otherSideAddress === zeroAddress) {
      setInvalidToken(token)
      return
    }

    setInvalidToken(false)
    setGnosisChainToMainnet(
      tokensByAddress[otherSideAddress] ?? {
        ...token,
        address: otherSideAddress,
        chainId: Chains.gnosis,
      },
    )
  }

  return (
    <Sections>
      <Section>
        <XDAIHeader />
        <Columns>
          <XDAIEthToGC />
          <XDAIGCToEth />
        </Columns>
      </Section>
      <Section>
        <OmnibridgeHeader
          aside={
            <TokenDropdown
              chainId={Chains.mainnet}
              defaultToken={mainnetToGnosisChainToken}
              onChange={onChangeToken}
            />
          }
        />
        <Columns>
          {invalidToken ? (
            <InvalidToken>
              <TokenIcon
                dimensions={48}
                iconSource={invalidToken.logoURI}
                symbol={invalidToken.symbol}
              />
              <InvalidTokenTitle>Invalid token</InvalidTokenTitle>
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
              <OmnibridgeMainnetToGnosisChain token={mainnetToGnosisChainToken} />
              <OmnibridgeGnosisChainToMainnet token={gnosisChainToMainnet} />
            </>
          )}
        </Columns>
      </Section>
    </Sections>
  )
}

export const DailyBridgeLimits: React.FC = genericSuspense(
  () => {
    return <Limits />
  },
  () => (
    <Sections>
      <Section>
        <XDAIHeader />
        <Columns>
          <Placeholder />
          <Placeholder />
        </Columns>
      </Section>
      <Section>
        <OmnibridgeHeader />
        <Columns>
          <Placeholder />
          <Placeholder />
        </Columns>
      </Section>
    </Sections>
  ),
)
