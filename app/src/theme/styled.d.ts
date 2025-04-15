import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      black: string
      borderColor: string
      cream: string
      creamDark: string
      creamDarker: string
      creamDarkest: string
      creamLight: string
      cream_50: string
      darkGreen: string
      darkGrey: string
      darkSecondary: string
      darkerGrey: string
      darkestGrey: string
      error: string
      lightGrey: string
      primary: string
      primaryDark: string
      primaryLight: string
      primary_50: string
      primary_60: string
      secondary: string
      success: string
      textColor: string
      warning: string
      white: string
      white_50: string
    }
    body: {
      backgroundColor: string
    }
    common: {
      borderRadius: string
      borderRadiusBig: string
      borderRadiusBigger: string
      space: string
    }
    fonts: {
      defaultSize: string
      family: string
      familyCode: string
      familyHeading: string
    }
    breakPoints: {
      desktopStart: string
      desktopWideStart: string
      tabletLandscapeWideStart: string
      tabletLandscapeStart: string
      tabletPortraitStart: string
    }
  }
}
