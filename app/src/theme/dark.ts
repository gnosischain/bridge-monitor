/* Dark Theme            */
/* Add only colors here. */

import { darken } from 'polished'

const borderColor = 'rgba(250,250,250,0.2)'
const darkGray = 'rgb(10, 25, 50)'
const darkGrayDarkened = darken(0.1, 'rgb(10, 25, 50)')
const componentBackgroundColor = 'rgba(13, 2, 2, 0.85)'

const primary = '#3E6957'
const primaryDark = '#133629'
const secondary = '#A6BCF5'
const tertiary = '#A6CFD5'
const textColor = '#F0EBDE'
const black = '#0A0C0B'
const white = '#FBF9F3'
const darkestGrey = '#161D1A'
const darkerGrey = '#1E2723'
const darkGrey = '#252F2B'
const cream = '#F0EBDE'
const creamLight = '#F8F5ED'
const creamDark = '#DDD4BE'
const error = '#FF5935'
const warning = '#FAB754'
const success = '#40D194'

const primaryGradient = 'linear-gradient(180deg, #3E6655 0%, #3E6957 100%);'
const grayGradient = 'linear-gradient(180deg, #323D38 0%, #252F2B 100%)'

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
    borderColor: borderColor,
    componentBackgroundColor: componentBackgroundColor,
    error: error,
    warning: warning,
    success: success,
    mainBodyBackground: darkestGrey,
    primary: primary,
    primaryDark: primaryDark,
    secondary: secondary,
    tertiary: tertiary,
    textColor: textColor,
    black: black,
    white: white,
    darkestGrey: darkestGrey,
    darkerGrey: darkerGrey,
    darkGrey: darkGrey,
    cream: cream,
    creamLight: creamLight,
    creamDark: creamDark,
  },
  dropdown: {
    background: darkerGrey,
    borderColor: darkerGrey,
    boxShadow: 'none',
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
    backgroundColor: componentBackgroundColor,
    borderColor: borderColor,
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.25)',
  },
}
