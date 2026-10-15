import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
`

const HeaderInner = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  row-gap: calc(var(--theme-common-space) * 0.75);
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 3rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 3.4rem;
  }
`

const SubTitle = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0 0 calc(var(--theme-common-space) * 1.5);
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.6;
  margin: 0;

  b {
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 600;
  }
`

const ExternalLink = styled.a`
  color: ${({ theme: { colors } }) => colors.violet};
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export const Header: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <HeaderInner>
      <Title>USDC swap</Title>
      <SubTitle>Swap USDC.e {`<->`} USDC on Gnosis Chain.</SubTitle>
      <Text>
        <b>USDC (old)</b> is the wrapped version of the token minted by the Omnibridge.
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
