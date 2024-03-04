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

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 3.2rem;
  }
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

export const Header: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <HeaderInner>
      <Title>Bridge</Title>
      <Text>Transfer assets between Ethereum and Gnosis Chain. </Text>
    </HeaderInner>
  </Wrapper>
)
