/* Properties common to any themes                     */
/* Add dimensions, fonts, paddings, margins, etc. here */

const borderRadius = '4px'
const radioAndCheckDimensions = '14px'
const componentPadding = '16px 24px'
const space = 8

export const common = {
  common: {
    borderRadius: borderRadius,
    space: space,
  },
  fonts: {
    defaultSize: '1.6rem',
    family: `'Karla', 'Helvetica Neue', 'Arial', 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'`,
    familyCode: `'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'`,
    familyHeading: `'Lora', 'Times New Roman', Times, serif, 'Georgia', 'Garamond', 'Cambria', 'PT Serif', 'Merriweather', 'Book Antiqua', Palatino, 'Palatino Linotype', 'American Typewriter', 'serif'`,
  },
  checkBox: {
    dimensions: radioAndCheckDimensions,
  },
  radioButton: {
    dimensions: radioAndCheckDimensions,
  },
  dropdown: {
    borderRadius: '8px',
  },
  header: {
    height: '100px',
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
  },
}
