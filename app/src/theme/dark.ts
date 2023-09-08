/* Dark Theme            */
/* Add only colors here. */

const borderColor = 'rgba(250,250,250,0.2)'
const darkGray = 'rgb(10, 25, 50)'
const componentBackgroundColor = 'rgba(13, 2, 2, 0.85)'

const primary = '#3E6957'
const primaryDark = '#133629'
const secondary = '#A6BCF5'
const darkSecondary = '#8799C7'
const tertiary = '#A6CFD5'
const textColor = '#F0EBDE'
const black = '#0A0C0B'
const white = '#FBF9F3'
const darkestGrey = '#161D1A'
const darkestGrey2 = '#101513'
const darkerGrey = '#1E2723'
const darkGrey = '#252F2B'
const lightGrey = '#323D38'
const cream = '#F0EBDE'
const creamLight = '#F8F5ED'
const creamDark = '#DDD4BE'
const error = '#FF5935'
const warning = '#FAB754'
const warningDark = '#D39435'
const success = '#40D194'
const successDark = '#32AF7B'
const darkGreen = '#3E6957'
const lightYellow = '#EEFB9E'

const primaryGradient = `linear-gradient(180deg, #3E6655 0%, ${primary} 100%)`
const grayGradient = `linear-gradient(180deg, ${lightGrey} 0%, ${darkGrey} 100%)`
const commonBoxShadow =
  '0 27px 80px rgba(0, 0, 0, 0.07), 0 10.4px 25.4815px rgba(0, 0, 0, 0.0425185), 0 2.2px 6.51852px rgba(0, 0, 0, 0.0274815)'

export const dark = {
  body: {
    backgroundColor: darkestGrey,
  },
  buttonDropdown: {
    backgroundColor: darkerGrey,
    backgroundColorHover: darkestGrey,
    borderColor: darkerGrey,
    borderColorHover: darkestGrey,
    color: textColor,
    colorHover: textColor,
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
  card: {
    backgroundColor: 'rgba(13, 2, 2, 0.65)',
    borderColor: borderColor,
  },
  checkBox: {
    backgroundColorActive: secondary,
    backgroundColor: darkGray,
    borderColor: borderColor,
  },
  colors: {
    black: black,
    borderColor: borderColor,
    componentBackgroundColor: componentBackgroundColor,
    cream: cream,
    creamDark: creamDark,
    creamLight: creamLight,
    darkGrey: darkGrey,
    darkSecondary: darkSecondary,
    darkerGrey: darkerGrey,
    darkestGrey2: darkestGrey2,
    darkestGrey: darkestGrey,
    error: error,
    lightGrey: lightGrey,
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
    darkGreen: darkGreen,
    lightYellow: lightYellow,
  },
  dropdown: {
    background: lightGrey,
    borderColor: 'transparent',
    boxShadow: commonBoxShadow,
    item: {
      backgroundColor: 'transparent',
      backgroundColorHover: primary,
      borderColor: 'transparent',
      color: textColor,
      colorActive: textColor,
    },
  },
  gradients: {
    primary: primaryGradient,
    gray: grayGradient,
  },
  textField: {
    backgroundColor: darkerGrey,
    borderColor: darkerGrey,
    color: textColor,
    errorColor: error,
    successColor: success,
    active: {
      backgroundColor: darkestGrey,
      borderColor: primary,
      boxShadow: 'none',
      color: white,
    },
    placeholder: {
      color: creamDark,
    },
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: textColor,
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
  radioButton: {
    backgroundColorActive: secondary,
    backgroundColor: darkGray,
    borderColor: borderColor,
  },
  onBoard: {
    backgroundColor: componentBackgroundColor,
    color: textColor,
    borderRadius: '5px',
    borderColor: borderColor,
    sidebarBackgroundColor: 'rgb(235, 235, 237)',
  },
  toast: {
    backgroundColor: primary,
    borderColor: primary,
    boxShadow: commonBoxShadow,
  },
}
