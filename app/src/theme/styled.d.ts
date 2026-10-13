import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      emerald: string
      faint: string
      fog: string
      ink: string
      inkHover: string
      lilac: string
      line: string
      mint: string
      mintSoft: string
      mist: string
      page: string
      surface: string
      violet: string

      error: string
      errorSoft: string
      success: string
      successSoft: string
      warning: string
      warningSoft: string

      black: string
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
      primary: string
      primaryDark: string
      primaryLight: string
      primary_50: string
      primary_60: string
      secondary: string
      textColor: string
      white: string
      white_50: string
    }
    body: {
      backgroundColor: string
    }
    backdrop: {
      gradient: string
      dots: string
      dotsAccent: string
    }
    common: {
      borderRadius: string
      borderRadiusBig: string
      borderRadiusBigger: string
      shadow: string
      space: string
    }
    fonts: {
      defaultSize: string
      family: string
      familyCode: string
      familyHeading: string
      fontFamily: string
    }
    breakPoints: {
      desktopStart: string
      desktopWideStart: string
      tabletLandscapeWideStart: string
      tabletLandscapeStart: string
      tabletPortraitStart: string
    }
    dropdown: {
      borderRadius: string
      background: string
      borderColor: string
      boxShadow: string
      item: {
        backgroundColor: string
        backgroundColorHover: string
        backgroundColorActive: string
        borderColor: string
        color: string
        colorActive: string
      }
    }
    layout: {
      horizontalPaddingDesktopStart: string
      horizontalPaddingDesktopWideStart: string
      horizontalPaddingMobile: string
      horizontalPaddingTabletLandscapeStart: string
      horizontalPaddingTabletPortraitStart: string
      maxWidth: string
    }
    card: {
      backgroundColor: string
      borderColor: string
      borderRadius: string
      padding: string
    }
    buttonDropdown: {
      backgroundColor: string
      backgroundColorHover: string
      borderColor: string
      borderColorHover: string
      color: string
      colorHover: string
    }
    buttonPrimary: {
      backgroundColor: string
      backgroundColorHover: string
      borderColor: string
      borderColorHover: string
      color: string
      colorHover: string
    }
    textField: {
      backgroundColor: string
      borderColor: string
      color: string
      errorColor: string
      height: string
      successColor: string
      active: {
        backgroundColor: string
        borderColor: string
        boxShadow: string
        color: string
      }
      placeholder: {
        color: string
      }
    }
    modal: {
      overlayColor: string
    }
    toast: {
      backgroundColor: string
      borderColor: string
      boxShadow: string
    }
  }
}
