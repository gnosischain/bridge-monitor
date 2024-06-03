import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  width: 100%;
`

const HeaderInner = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  row-gap: var(--theme-common-space);
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 2.8rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 3.2rem;
  }
`

const SubTitle = styled.p`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  margin-bottom: 2rem;
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const ExternalLink = styled.a`
  color: ${({ theme: { colors } }) => colors.textColor};
`

export const Header: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <HeaderInner>
      <Title>USDC swap</Title>
      <SubTitle>Swap USDC.e {`<->`} USDC on Gnosis Chain.</SubTitle>
      <Text>
        <b>USDC (old)</b> is the wrapped version of the token minted by the Omnibridge.
        {/* </Text>
      <Text> */}
        <br />
        <b>USDC.e</b> is the token version that follows the{' '}
        <ExternalLink
          href="https://github.com/circlefin/stablecoin-evm/blob/master/doc/bridged_USDC_standard.md"
          rel="noreferrer"
          target="_blank"
        >
          Circle standard
        </ExternalLink>{' '}
        and will be used to bridge <b>USDC</b> via CCTP in the future
      </Text>
    </HeaderInner>
  </Wrapper>
)
