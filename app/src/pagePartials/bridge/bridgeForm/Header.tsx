import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 0.75);
  width: 100%;
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 3rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.06;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 3.4rem;
  }
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
`

export const Header: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <Title>Bridge</Title>
    <Text>Transfer assets between Ethereum and Gnosis Chain.</Text>
  </Wrapper>
)
