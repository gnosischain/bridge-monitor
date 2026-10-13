import styled from 'styled-components'

export const MainTitle = styled.h1`
  color: ${({ theme: { colors } }) => colors.ink};
  font-weight: 400;
  font-size: 3.2rem;
  margin: 0;
  line-height: 1.05;
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  letter-spacing: -0.02em;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 3.6rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    font-size: 4rem;
  }
`
