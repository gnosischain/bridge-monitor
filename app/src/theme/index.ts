/* Theme */

const borderRadius = '4px'
const borderRadiusBig = '8px'
const borderRadiusBigger = '16px'
const radioAndCheckDimensions = '14px'
const componentPadding = '16px 24px'
const space = 8

// Colors, generic names. Do not export these, use to build the theme with specific names.
const color_001 = '#F0EBDE'
const color_002 = '#3E6957'
const color_003 = '#133629'
const color_004 = '#FBF9F3'
const color_005 = '#DDD4BE'
const color_006 = '#0A0C0B'
const color_007 = 'rgba(250,250,250,0.2)'
const color_008 = '#F8F5ED'
const color_009 = 'rgb(10, 25, 50)'
const color_010 = '#252F2B'
const color_011 = '#8799C7'
const color_012 = '#1E2723'
const color_013 = '#161D1A'
const color_014 = '#DD7143'
const color_015 = '#323D38'
const color_016 = '#A6BCF5'
const color_017 = '#439B2D'
const color_018 = '#FAB754'
const color_019 = `rgba(221, 212, 190, 0.50)`
const color_020 = `rgba(210, 200, 173, 0.30)`
const color_021 = `rgba(62, 105, 87, 0.6)`
const color_022 = `rgba(13, 2, 2, 0.65)`
const color_023 = 'rgba(210, 200, 173, 0.70)'
const color_024 = 'rgba(0, 0, 0, 0.7)'
const color_025 = `rgba(62, 105, 87, 0.5)`
const color_026 = `rgba(248, 245, 237, 0.5)`
const color_027 = `#4b886e`
const color_028 = `rgba(251, 249, 243, 0.50)`

// Named colors
export const theme = {
  colors: {
    black: color_006,
    borderColor: color_007,
    cream: color_001,
    creamDark: color_005,
    creamDarker: color_019,
    creamDarkest: color_020,
    creamLight: color_008,
    cream_50: color_026,
    darkGreen: color_002,
    darkGrey: color_010,
    darkSecondary: color_011,
    darkerGrey: color_012,
    darkestGrey: color_013,
    error: color_014,
    lightGrey: color_015,
    primary: color_002,
    primaryDark: color_003,
    primaryLight: color_027,
    primary_50: color_025,
    primary_60: color_021,
    secondary: color_016,
    success: color_017,
    textColor: color_002,
    warning: color_018,
    white: color_004,
    white_50: color_028,
  },
  body: {
    backgroundColor: color_001,
  },
  common: {
    borderRadius: borderRadius,
    borderRadiusBig: borderRadiusBig,
    borderRadiusBigger: borderRadiusBigger,
    space: `${space}px`,
  },
  fonts: {
    defaultSize: '1.6rem',
    family: `'Karla', 'Helvetica Neue', 'Arial', 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'`,
    familyCode: `'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'`,
    familyHeading: `'Lora', 'Times New Roman', Times, serif, 'Georgia', 'Garamond', 'Cambria', 'PT Serif', 'Merriweather', 'Book Antiqua', Palatino, 'Palatino Linotype', 'American Typewriter', 'serif'`,
  },
  checkBox: {
    dimensions: radioAndCheckDimensions,
    backgroundColorActive: color_016,
    backgroundColor: color_009,
    borderColor: color_007,
  },
  radioButton: {
    dimensions: radioAndCheckDimensions,
    backgroundColorActive: color_016,
    backgroundColor: color_009,
    borderColor: color_007,
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
      backgroundColorActive: color_019,
      borderColor: 'transparent',
      color: color_002,
      colorActive: color_002,
    },
  },
  header: {
    backgroundColor: color_024,
    color: color_002,
  },
  layout: {
    horizontalPaddingDesktopStart: `${space * 3}px`,
    horizontalPaddingDesktopWideStart: `${space * 5}px`,
    horizontalPaddingMobile: `${space}px`,
    horizontalPaddingTabletLandscapeStart: `${space * 2}px`,
    horizontalPaddingTabletPortraitStart: `${space * 2}px`,
    maxWidth: '1400px',
  },
  breakPoints: {
    desktopStart: '1025px',
    desktopWideStart: '1281px',
    tabletLandscapeWideStart: '869px',
    tabletLandscapeStart: '769px',
    tabletPortraitStart: '481px',
  },
  card: {
    backgroundColor: color_022,
    borderColor: color_007,
    borderRadius: borderRadius,
    padding: componentPadding,
  },
  buttonDropdown: {
    backgroundColor: color_001,
    backgroundColorHover: color_008,
    borderColor: color_001,
    borderColorHover: color_001,
    color: color_002,
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
    backgroundColor: color_010,
    backgroundColorHover: color_012,
    borderColor: color_010,
    borderColorHover: color_012,
    color: color_001,
    colorHover: color_001,
  },
  textField: {
    backgroundColor: color_001,
    borderColor: color_001,
    color: color_002,
    errorColor: color_014,
    height: '54px',
    successColor: color_017,
    active: {
      backgroundColor: color_008,
      borderColor: color_001,
      boxShadow: 'none',
      color: color_002,
    },
    placeholder: {
      color: color_021,
    },
  },
  mainMenu: {
    color: color_002,
  },
  modal: {
    overlayColor: color_023,
  },
  onBoard: {
    backgroundColor: color_001,
    borderColor: 'transparent',
    color: color_002,
    sidebarBackgroundColor: color_005,
  },
  toast: {
    backgroundColor: color_008,
    borderColor: color_008,
    boxShadow:
      '0 27px 80px rgba(0, 0, 0, 0.07), 0 10.4px 25.4815px rgba(0, 0, 0, 0.0425185), 0 2.2px 6.51852px rgba(0, 0, 0, 0.0274815)',
  },
}
