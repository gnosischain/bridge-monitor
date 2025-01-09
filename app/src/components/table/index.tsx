import styled from 'styled-components'

export const Table = styled.div`
  --table-padding-vertical: calc(var(--theme-common-space) * 3);
  --table-padding-common: calc(var(--theme-common-space) * 2);
  --table-border-radius: ${({ theme: { common } }) => common.borderRadius};

  column-gap: calc(var(--theme-common-space) / 2);
  display: grid;
  min-width: fit-content;
  overflow-x: auto;
  row-gap: calc(var(--theme-common-space) / 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: var(--theme-common-space);
    row-gap: var(--theme-common-space);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    column-gap: 0;
    grid-template-columns: 1fr;
    padding-left: var(--table-padding-common);
    padding-right: var(--table-padding-common);
    row-gap: 0;
  }
`

export const TR = styled.div<{ $compact?: boolean }>`
  background-color: ${({ theme: { colors } }) => colors.cream};
  border: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-width: 100%;
  padding: var(--table-padding-common);
  row-gap: calc(var(--table-padding-common));
  transition: none;

  &:hover > * {
    opacity: 0.8;
  }

  &:active > * {
    opacity: 0.5;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    background-color: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
    border-radius: 0;
    border-right: none;
    column-gap: calc(var(--table-padding-common));
    display: grid;
    grid-template-columns: ${({ $compact }) => {
      const addressWidth = 'minmax(185px, 1fr)'
      const bridgeDirectionWidth = 'minmax(155px, 1fr)'
      const statusWidth = 'minmax(100px, 1fr)'
      const baseTemplate = `${addressWidth} ${bridgeDirectionWidth} ${addressWidth} 10px ${addressWidth}`

      return $compact ? `${baseTemplate} ${statusWidth}` : `${baseTemplate} 1fr ${statusWidth}`
    }};
    margin: 0;
    padding: 0;

    &:last-child {
      border-bottom: none;
    }
  }
`

export const THead = styled(TR)`
  border-bottom: none;
  display: none;
  cursor: default;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    display: grid;

    &:hover,
    &:active {
      opacity: 1;
    }
  }
`

export const TD = styled.div`
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-start;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    padding-bottom: var(--table-padding-vertical);
    padding-top: var(--table-padding-vertical);
  }
`

export const TH = styled(TD)`
  --th-padding-top: calc(var(--theme-common-space) * 4);

  font-size: 1.4rem;
  font-weight: 400;
  padding-top: var(--th-padding-top);
  white-space: nowrap;
`
