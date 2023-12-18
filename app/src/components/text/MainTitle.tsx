import styled from 'styled-components'

export const MainTitle = styled.h1`
  font-weight: 500;
  font-size: 2.8rem;
  margin: 0;
  line-height: 1;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 3.2rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 3.6rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    font-size: 4rem;
  }
`
