import { createGlobalStyle } from 'styled-components'
import { onBoardCSS } from '@/src/theme/onBoard'
import { datePickerCSS } from '@/src/theme/datePicker'
import { tooltipCSS } from '@/src/theme/tooltip'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GlobalStyles = createGlobalStyle<{ theme: any }>`

  :root {
      /* Tooltip */
      --rt-color-dark:  ${({ theme: { colors } }) => colors.black};
      --rt-color-info:  ${({ theme: { colors } }) => colors.white};
      --rt-opacity: 1;

      /* some common variables (just for convenience) */
      --theme-layout-vertical-padding: 48px;
      --theme-layout-vertical-padding-xl: calc(var(--theme-layout-vertical-padding) * 2);
      --theme-layout-vertical-padding-xxl: calc(var(--theme-layout-vertical-padding) * 3);
      --theme-common-space: ${({ theme: { common } }) => common.space};
  }

  html {
    font-size: 10px;
    scroll-behavior: smooth;
  }

  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${({ theme: { body } }) => body.backgroundColor};
    background-size: 1000px auto;
    background-image: url('/images/bg-body.jpg');
    color: ${({ theme: { colors } }) => colors.textColor};
    font-family: ${({ theme: { fonts } }) => fonts.family};
    font-size: ${({ theme: { fonts } }) => fonts.defaultSize};
    min-height: 100vh;
    outline-color: ${({ theme: { colors } }) => colors.secondary};
    scroll-behavior: smooth;

    @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
      background-attachment: fixed;
      background-size: cover;
    }
  }

  code {
    font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  }

  #__next {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    row-gap: calc(var(--theme-common-space) * 5);
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

  a,
  button{
    transition: all 0.15s ease-in-out;
  }

  button{
    font-family: ${({ theme: { fonts } }) => fonts.family};
  }

  h1, h2, h3, h4 {
    line-height: 1.2;
  }

  h2 {
    font-weight: 500;
    font-size: 2.4rem;
    margin: ${({ theme: { common } }) => common.space}px 0;

    @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
      font-size: 2.8rem;
      margin: calc(var(--theme-common-space) * 2) 0;
    }

    @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
      margin: calc(var(--theme-common-space) * 3) 0;
    }
  }

  h3 {
    font-weight: 500;
    font-size: 1.8rem;
    margin: calc(var(--theme-common-space) * 2) 0;

    @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
      font-size: 2.1rem;
    }

    strong {
      font-family: ${({ theme: { fonts } }) => fonts.family};
    }
  }

  .number {
    font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  }

  ${onBoardCSS}
  ${datePickerCSS}
  ${tooltipCSS}
`
