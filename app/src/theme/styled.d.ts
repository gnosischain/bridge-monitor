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
      titleColor: string
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
    checkBox: {
      dimensions: string
      backgroundColorActive: string
      backgroundColor: string
      borderColor: string
    }
    radioButton: {
      dimensions: string
      backgroundColorActive: string
      backgroundColor: string
      borderColor: string
    }
    header: {
      backgroundColor: string
      color: string
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
    buttonSecondary: {
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
    mainMenu: {
      color: string
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
