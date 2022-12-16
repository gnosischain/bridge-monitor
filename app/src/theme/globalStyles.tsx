import { createGlobalStyle } from 'styled-components'

import { onBoardCSS } from '@/src/theme/onBoard'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GlobalStyles = createGlobalStyle<{ theme: any }>`
  html {
    font-size: 10px;
    scroll-behavior: smooth;
  }

  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${({ theme: { body } }) => body.backgroundColor};
    color: ${({ theme: { colors } }) => colors.textColor};
    font-family: ${({ theme: { fonts } }) => fonts.family};
    font-size: ${({ theme: { fonts } }) => fonts.defaultSize};
    min-height: 100vh;
    outline-color: ${({ theme: { colors } }) => colors.secondary};
  }

  code {
    font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  }

  #__next {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  ::selection {
    color: ${({ theme: { colors } }) => colors.white} !important;
    background: ${({ theme: { colors } }) => colors.primary} !important;
  }
  ::-moz-selection {
    color: ${({ theme: { colors } }) => colors.white} !important;
    background: ${({ theme: { colors } }) => colors.primary} !important;
  }
  a, button{
    transition: all 0.3s ease-in-out;
  }
  h1, h2, h3, h4{
    font-family: ${({ theme: { fonts } }) => fonts.familyTitles};
  }
  h1{
    font-weight: 500;
    font-size: 2.8rem;
    margin: ${({ theme: { common } }) => common.space * 2}px 0;
    @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
      font-size: 3.2rem;
      margin: ${({ theme: { common } }) => common.space * 3}px 0;
    }
    @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
      font-size: 3.6rem;
    }
    @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
      font-size: 4rem;
      margin: ${({ theme: { common } }) => common.space * 4}px 0;
    }
  }
  h2{
    font-weight: 500;
    font-size: 2.4rem;
    margin: ${({ theme: { common } }) => common.space}px 0;
    @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
      font-size: 2.8rem;
      margin: ${({ theme: { common } }) => common.space * 2}px 0;
    }
    @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
      margin: ${({ theme: { common } }) => common.space * 3}px 0;
    }
  }
  h3{
    font-weight: 500;
    font-size: 1.8rem;
    margin: ${({ theme: { common } }) => common.space * 2}px 0;
    @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
      font-size: 2.1rem;
    }
    strong{
      font-family: ${({ theme: { fonts } }) => fonts.family};
    }
  }
  .number{
    font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  }

  ${onBoardCSS}
`
