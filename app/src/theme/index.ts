import { inter, playfairDisplay } from '@/src/theme/fonts'

/* Theme */

const borderRadius = '8px'
const borderRadiusBig = '12px'
const borderRadiusBigger = '16px'
const space = 8

// Gnosis brand palette (gnosis.io, build.gnosischain.com). Do not export these, use to build the
// theme with specific names.
const ink = '#07052C'
const inkHover = '#1A1751'
const violet = '#3F2ACD'
const mint = '#8DE9AA'
const mintSoft = '#D6F6E2'
const lilac = '#EDEBFB'
const page = '#F6F1FA'
const mist = '#FBFAFD'
const white = '#FFFFFF'
const fog = '#55546F'
const faint = '#8E8CA6'
const line = '#E3E1EE'
const emerald = '#047857'
// States. Each text colour keeps at least 4.5:1 contrast on white and on the page background.
const amber = '#B45309'
const amberSoft = '#FFF4E4'
const crimson = '#C81E4B'
const crimsonSoft = '#FDEAEF'

const shadow = '0 16px 40px -16px rgba(7, 5, 44, 0.25)'

// Named colors
export const theme = {
  colors: {
    emerald,
    faint,
    fog,
    ink,
    inkHover,
    lilac,
    line,
    mint,
    mist,
    page,
    surface: white,
    violet,

    error: crimson,
    errorSoft: crimsonSoft,
    success: emerald,
    successSoft: mintSoft,
    warning: amber,
    warningSoft: amberSoft,
  },
  body: {
    backgroundColor: page,
  },
  backdrop: {
    gradient: `linear-gradient(180deg, #D6E2F4 0%, #DBEEEA 42%, #DDF2E6 62%, ${page} 96%)`,
    dots: violet,
    dotsAccent: mint,
  },
  common: {
    borderRadius: borderRadius,
    borderRadiusBig: borderRadiusBig,
    borderRadiusBigger: borderRadiusBigger,
    shadow: shadow,
    space: `${space}px`,
  },
  fonts: {
    defaultSize: '1.6rem',
    family: `${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
    familyCode: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace`,
    familyHeading: `${playfairDisplay.style.fontFamily}, Georgia, 'Times New Roman', serif`,
  },
  dropdown: {
    borderRadius: borderRadiusBig,
    background: white,
    borderColor: line,
    boxShadow: shadow,
    item: {
      backgroundColor: 'transparent',
      backgroundColorHover: page,
      backgroundColorActive: lilac,
      borderColor: 'transparent',
      color: ink,
      colorActive: violet,
    },
  },
  layout: {
    horizontalPaddingDesktopStart: `${space * 5}px`,
    horizontalPaddingDesktopWideStart: `${space * 6}px`,
    horizontalPaddingMobile: `${space * 2}px`,
    horizontalPaddingTabletLandscapeStart: `${space * 3}px`,
    horizontalPaddingTabletPortraitStart: `${space * 2.5}px`,
    maxWidth: '1440px',
  },
  breakPoints: {
    desktopStart: '1025px',
    desktopWideStart: '1281px',
    tabletLandscapeWideStart: '869px',
    tabletLandscapeStart: '769px',
    tabletPortraitStart: '481px',
  },
  buttonDropdown: {
    backgroundColor: page,
    backgroundColorHover: lilac,
    borderColor: page,
    borderColorHover: lilac,
    color: ink,
    colorHover: ink,
  },
  buttonPrimary: {
    backgroundColor: ink,
    backgroundColorHover: inkHover,
    borderColor: ink,
    borderColorHover: inkHover,
    color: white,
    colorHover: white,
  },
  textField: {
    backgroundColor: page,
    borderColor: page,
    color: ink,
    errorColor: crimson,
    height: '48px',
    successColor: emerald,
    active: {
      backgroundColor: white,
      borderColor: violet,
      boxShadow: 'none',
      color: ink,
    },
    placeholder: {
      color: faint,
    },
  },
  modal: {
    overlayColor: 'rgba(7, 5, 44, 0.4)',
  },
  toast: {
    backgroundColor: white,
    borderColor: line,
    boxShadow: shadow,
  },
}
