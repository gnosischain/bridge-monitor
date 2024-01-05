/* Theme */

const borderRadius = '4px'
const radioAndCheckDimensions = '14px'
const componentPadding = '16px 24px'
const space = 8

const borderColor = 'rgba(250,250,250,0.2)'
const darkGray = 'rgb(10, 25, 50)'

const black = '#0A0C0B'
const commonBoxShadow =
  '0 27px 80px rgba(0, 0, 0, 0.07), 0 10.4px 25.4815px rgba(0, 0, 0, 0.0425185), 0 2.2px 6.51852px rgba(0, 0, 0, 0.0274815)'
const creamRGB = '240, 235, 222'
const creamLight = '#F8F5ED'
const darkGrey = '#252F2B'
const darkSecondary = '#8799C7'
const darkerGrey = '#1E2723'
const darkestGrey = '#161D1A'
const darkestGrey2 = '#101513'
const error = '#FF5935'
const green_1 = '#63b090'
const green_2 = '#59927a'
const lightGrey = '#323D38'
const lightYellow = '#EEFB9E'
const secondary = '#A6BCF5'
const success = '#40D194'
const successDark = '#32AF7B'
const tertiary = '#A6CFD5'
const warning = '#FAB754'
const warningDark = '#D39435'

const grayGradient = `linear-gradient(180deg, ${lightGrey} 0%, ${darkGrey} 100%)`
const cream06 = `rgba(${creamRGB}, 0.6)`

// Colors, generic names. Do not export these, use to build the theme with specific names.
const color_001 = '#F0EBDE'
const color_002 = '#3E6957'
const color_003 = '#133629'
const color_004 = '#FBF9F3'
const color_005 = '#DDD4BE'

const cream = color_001
const primary = color_002
const primaryGradient = `linear-gradient(180deg, #3E6655 0%, ${color_002} 100%)`
const primaryDark = color_003
const darkGreen = color_002
const textColor = color_002
const white = color_004
const creamDark = color_005

export const theme = {
  colors: {
    black: black,
    borderColor: borderColor,
    cream: cream,
    creamDark: creamDark,
    creamLight: creamLight,
    darkGreen: darkGreen,
    darkGrey: darkGrey,
    darkSecondary: darkSecondary,
    darkerGrey: darkerGrey,
    darkestGrey2: darkestGrey2,
    darkestGrey: darkestGrey,
    error: error,
    green_1: green_1,
    green_2: green_2,
    lightGrey: lightGrey,
    lightYellow: lightYellow,
    mainBodyBackground: darkestGrey,
    primary: primary,
    primaryDark: primaryDark,
    secondary: secondary,
    success: success,
    successDark: successDark,
    tertiary: tertiary,
    textColor: textColor,
    warning: warning,
    warningDark: warningDark,
    white: white,
  },
  body: {
    backgroundColor: color_001,
  },
  common: {
    borderRadius: borderRadius,
    space: `${space}px`,
  },
  fonts: {
    defaultSize: '1.6rem',
    family: `'Karla', 'Helvetica Neue', 'Arial', 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'`,
    familyCode: `'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'`,
  },
  checkBox: {
    dimensions: radioAndCheckDimensions,
    backgroundColorActive: secondary,
    backgroundColor: darkGray,
    borderColor: borderColor,
  },
  radioButton: {
    dimensions: radioAndCheckDimensions,
    backgroundColorActive: secondary,
    backgroundColor: darkGray,
    borderColor: borderColor,
  },
  dropdown: {
    borderRadius: '8px',
    background: lightGrey,
    borderColor: 'transparent',
    boxShadow: commonBoxShadow,
    item: {
      backgroundColor: 'transparent',
      backgroundColorHover: primary,
      backgroundColorActive: darkGrey,
      borderColor: 'transparent',
      color: textColor,
      colorActive: textColor,
    },
  },
  header: {
    height: '100px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: textColor,
  },
  layout: {
    horizontalPaddingDesktopStart: space * 3 + 'px',
    horizontalPaddingDesktopWideStart: space * 5 + 'px',
    horizontalPaddingMobile: space + 'px',
    horizontalPaddingTabletLandscapeStart: space * 2 + 'px',
    horizontalPaddingTabletPortraitStart: space * 2 + 'px',
    maxWidth: '1504px',
  },
  breakPoints: {
    desktopStart: '1025px',
    desktopWideStart: '1281px',
    tabletLandscapeStart: '769px',
    tabletPortraitStart: '481px',
  },
  card: {
    borderRadius: borderRadius,
    padding: componentPadding,
    backgroundColor: 'rgba(13, 2, 2, 0.65)',
    borderColor: borderColor,
  },
  buttonDropdown: {
    backgroundColor: darkerGrey,
    backgroundColorHover: darkestGrey,
    borderColor: darkerGrey,
    borderColorHover: darkestGrey,
    color: cream06,
    colorHover: cream,
  },
  buttonPrimary: {
    backgroundColor: primary,
    backgroundColorHover: primaryDark,
    borderColor: primary,
    borderColorHover: primaryDark,
    color: white,
    colorHover: white,
  },
  buttonSecondary: {
    backgroundColor: darkGrey,
    backgroundColorHover: darkerGrey,
    borderColor: darkGrey,
    borderColorHover: darkerGrey,
    color: cream,
    colorHover: cream,
  },
  gradients: {
    primary: primaryGradient,
    gray: grayGradient,
  },
  textField: {
    backgroundColor: darkerGrey,
    borderColor: darkerGrey,
    color: cream,
    errorColor: error,
    height: '42px',
    successColor: success,
    active: {
      backgroundColor: darkestGrey,
      borderColor: darkestGrey,
      boxShadow: 'none',
      color: cream,
    },
    placeholder: {
      color: cream06,
    },
  },
  mainMenu: {
    color: textColor,
  },
  mobileMenu: {
    color: textColor,
    backgroundColor: '#000',
    borderColor: borderColor,
  },
  modal: {
    overlayColor: 'rgba(0, 0, 0, 0.8)',
  },
  onBoard: {
    backgroundColor: darkGrey,
    borderColor: 'transparent',
    color: textColor,
    sidebarBackgroundColor: darkestGrey2,
  },
  toast: {
    backgroundColor: primary,
    borderColor: primary,
    boxShadow: commonBoxShadow,
  },
}
