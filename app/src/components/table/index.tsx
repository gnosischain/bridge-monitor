import styled from 'styled-components'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'

// Below desktop-wide width each row is a tinted card in a grid; from desktop-wide up the rows form
// one flat table with hairline separators. Rows reach the card's edges, so their hover fill does too.
export const Table = styled.div`
  --table-padding-vertical: calc(var(--theme-common-space) * 2);
  --table-padding-common: calc(var(--theme-common-space) * 2);
  --table-row-padding-horizontal: calc(var(--theme-common-space) * 3);

  column-gap: var(--theme-common-space);
  display: grid;
  min-width: fit-content;
  overflow-x: auto;
  row-gap: var(--theme-common-space);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    column-gap: 0;
    grid-template-columns: 1fr;
    row-gap: 0;
  }
`

export const TR = styled.div<{ $compact?: boolean }>`
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-width: 100%;
  padding: var(--table-padding-common);
  row-gap: calc(var(--table-padding-common));
  transition: background-color 0.15s linear;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};
  }

  &:active > * {
    opacity: 0.6;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    background-color: transparent;
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
    border-radius: 0;
    column-gap: calc(var(--table-padding-common));
    display: grid;
    grid-template-columns: ${({ $compact }) => {
      const addressWidth = 'minmax(185px, 1fr)'
      const bridgeDirectionWidth = 'minmax(170px, 1fr)'
      const statusWidth = 'minmax(120px, 1fr)'
      const baseTemplate = `${addressWidth} ${bridgeDirectionWidth} ${addressWidth} 10px ${addressWidth}`

      return $compact ? `${baseTemplate} ${statusWidth}` : `${baseTemplate} 1fr ${statusWidth}`
    }};
    margin: 0;
    padding: 0 var(--table-row-padding-horizontal);

    &:hover {
      background-color: ${({ theme: { colors } }) => colors.page};
    }

    &:last-child {
      border-bottom: none;
    }
  }
`

export const THead = styled(TR)`
  cursor: default;
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    display: grid;

    &:hover {
      background-color: transparent;
    }

    &:active > * {
      opacity: 1;
    }
  }
`

export const TD = styled.div`
  color: ${({ theme: { colors } }) => colors.ink};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-start;
  min-width: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    padding-bottom: var(--table-padding-vertical);
    padding-top: var(--table-padding-vertical);
  }
`

export const TH = styled(TD)`
  ${EyebrowCSS}

  white-space: nowrap;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    padding-bottom: calc(var(--theme-common-space) * 1.5);
    padding-top: calc(var(--theme-common-space) * 2);
  }
`
