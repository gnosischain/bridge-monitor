import styled from 'styled-components'

export const MainTitle = styled.h1`
  font-weight: 500;
  font-size: 2.8rem;
  margin: ${({ theme: { common } }) => common.space * 2}px 0;
  line-height: 1;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 3.2rem;
    margin: ${({ theme: { common } }) => common.space * 3}px 0;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 3.6rem;
    margin: ${({ theme: { common } }) => common.space * 4}px 0;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    font-size: 4rem;
    margin: ${({ theme: { common } }) => common.space * 5}px 0;
  }
`
