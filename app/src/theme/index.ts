/* Theme */

const borderRadius = '4px'
const radioAndCheckDimensions = '14px'
const componentPadding = '16px 24px'
const space = 8

const commonBoxShadow =
  '0 27px 80px rgba(0, 0, 0, 0.07), 0 10.4px 25.4815px rgba(0, 0, 0, 0.0425185), 0 2.2px 6.51852px rgba(0, 0, 0, 0.0274815)'

// Colors, generic names. Do not export these, use to build the theme with specific names.
const color_001 = '#F0EBDE'
const color_002 = '#3E6957'
const color_003 = '#133629'
const color_004 = '#FBF9F3'
const color_005 = '#DDD4BE'
const color_006 = '#3E6655'
const color_007 = '#0A0C0B'
const color_008 = 'rgba(250,250,250,0.2)'
const color_009 = '#F8F5ED'
const color_010 = 'rgb(10, 25, 50)'
const color_011 = '#252F2B'
const color_012 = '#8799C7'
const color_013 = '#1E2723'
const color_014 = '#161D1A'
const color_015 = '#101513'
const color_016 = '#DD7143'
const color_017 = '#63b090'
const color_018 = '#59927a'
const color_019 = '#323D38'
const color_020 = '#EEFB9E'
const color_021 = '#A6BCF5'
const color_022 = '#439B2D'
const color_023 = '#32AF7B'
const color_024 = '#A6CFD5'
const color_025 = '#FAB754'
const color_026 = '#D39435'
const color_028 = `rgba(221, 212, 190, 0.50)`
const color_029 = `rgba(210, 200, 173, 0.30)`
const color_030 = `rgba(62, 105, 87, 0.6)`
const color_031 = `rgba(13, 2, 2, 0.65)`
const color_032 = '#000'
const color_033 = 'rgba(0, 0, 0, 0.8)'
const color_034 = 'rgba(0, 0, 0, 0.7)'
const color_035 = `rgba(62, 105, 87, 0.5)`
const color_036 = `rgba(62, 105, 87, 0.2)`
const color_037 = `rgba(248, 245, 237, 0.5)`
const color_038 = `#4b886e`

// Gradients
const primaryGradient = `linear-gradient(180deg, ${color_006} 0%, ${color_002} 100%)`
const grayGradient = `linear-gradient(180deg, ${color_019} 0%, ${color_011} 100%)`

// Named colors
export const theme = {
  colors: {
    black: color_007,
    borderColor: color_008,
    cream: color_001,
    creamDark: color_005,
    creamDarker: color_028,
    creamDarkest: color_029,
    creamLight: color_009,
    cream_50: color_037,
    darkGreen: color_002,
    darkGrey: color_011,
    darkSecondary: color_012,
    darkerGrey: color_013,
    darkestGrey2: color_015,
    darkestGrey: color_014,
    error: color_016,
    green_1: color_017,
    green_2: color_018,
    lightGrey: color_019,
    lightYellow: color_020,
    mainBodyBackground: color_014,
    primary: color_002,
    primaryDark: color_003,
    primaryLight: color_038,
    primary_20: color_036,
    primary_50: color_035,
    primary_60: color_030,
    secondary: color_021,
    success: color_022,
    successDark: color_023,
    tertiary: color_024,
    textColor: color_002,
    warning: color_025,
    warningDark: color_026,
    white: color_004,
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
    backgroundColorActive: color_021,
    backgroundColor: color_010,
    borderColor: color_008,
  },
  radioButton: {
    dimensions: radioAndCheckDimensions,
    backgroundColorActive: color_021,
    backgroundColor: color_010,
    borderColor: color_008,
  },
  dropdown: {
    borderRadius: '8px',
    background: color_004,
    borderColor: 'transparent',
    boxShadow:
      '0 2.231px 2.775px 0 rgba(0, 0, 0, 0.01), 0 10.2px 7.8px 0 rgba(0, 0, 0, 0.01), 0 25.819px 20.925px 0 rgba(0, 0, 0, 0.02), 0 51px 48px 0 rgba(0, 0, 0, 0.03)',
    item: {
      backgroundColor: 'transparent',
      backgroundColorHover: color_001,
      backgroundColorActive: color_028,
      borderColor: 'transparent',
      color: color_002,
      colorActive: color_002,
    },
  },
  header: {
    backgroundColor: color_034,
    color: color_002,
  },
  layout: {
    horizontalPaddingDesktopStart: space * 3 + 'px',
    horizontalPaddingDesktopWideStart: space * 5 + 'px',
    horizontalPaddingMobile: space + 'px',
    horizontalPaddingTabletLandscapeStart: space * 2 + 'px',
    horizontalPaddingTabletPortraitStart: space * 2 + 'px',
    maxWidth: '1400px',
  },
  breakPoints: {
    desktopStart: '1025px',
    desktopWideStart: '1281px',
    tabletLandscapeStart: '769px',
    tabletPortraitStart: '481px',
  },
  card: {
    backgroundColor: color_031,
    borderColor: color_008,
    borderRadius: borderRadius,
    padding: componentPadding,
  },
  buttonDropdown: {
    backgroundColor: color_001,
    backgroundColorHover: color_004,
    borderColor: color_001,
    borderColorHover: color_004,
    color: color_030,
    colorHover: color_002,
  },
  buttonPrimary: {
    backgroundColor: color_002,
    backgroundColorHover: color_003,
    borderColor: color_002,
    borderColorHover: color_003,
    color: color_004,
    colorHover: color_004,
  },
  buttonSecondary: {
    backgroundColor: color_011,
    backgroundColorHover: color_013,
    borderColor: color_011,
    borderColorHover: color_013,
    color: color_001,
    colorHover: color_001,
  },
  gradients: {
    primary: primaryGradient,
    gray: grayGradient,
  },
  textField: {
    backgroundColor: color_001,
    borderColor: color_001,
    color: color_002,
    errorColor: color_016,
    height: '42px',
    successColor: color_022,
    active: {
      backgroundColor: color_004,
      borderColor: color_004,
      boxShadow: 'none',
      color: color_002,
    },
    placeholder: {
      color: color_030,
    },
  },
  mainMenu: {
    color: color_002,
  },
  mobileMenu: {
    color: color_002,
    backgroundColor: color_032,
    borderColor: color_008,
  },
  modal: {
    overlayColor: color_033,
  },
  onBoard: {
    backgroundColor: color_011,
    borderColor: 'transparent',
    color: color_002,
    sidebarBackgroundColor: color_015,
  },
  toast: {
    backgroundColor: color_009,
    borderColor: color_009,
    boxShadow: commonBoxShadow,
  },
}
