import styled from 'styled-components'

export const MainTitle = styled.h1`
  font-weight: 500;
  font-size: 2.6rem;
  margin: 0;
  line-height: 1;
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  letter-spacing: -0.5px;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 3rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 3.2rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    font-size: 3.2rem;
  }
`
