import styled from 'styled-components'

export const Table = styled.div`
  --table-padding-vertical: ${({ theme: { common } }) => common.space * 3}px;
  --table-padding-common: ${({ theme: { common } }) => common.space * 2}px;
  --table-border-radius: ${({ theme: { common } }) => common.borderRadius};

  display: grid;
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    grid-template-columns: 1fr;
  }
`

export const TR = styled.div<{ compact?: boolean }>`
  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  border-bottom: 4px solid ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: var(--table-border-radius);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-width: 0;
  padding: var(--table-padding-common);
  row-gap: calc(var(--table-padding-common));
  transition: background-color 0.15s linear;

  &:hover {
    &:active {
      opacity: 0.8;
    }
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    border-right: 4px solid ${({ theme: { colors } }) => colors.darkestGrey};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    background-color: transparent;
    border-bottom-color: ${({ theme: { colors } }) => colors.black};
    border-bottom-width: 1px;
    border-right: none;
    column-gap: calc(var(--table-padding-common) * 2);
    display: grid;
    grid-template-columns: ${({ compact }) => {
      const baseTemplate = '1fr 1fr 155px 10px 155px'

      return compact ? `${baseTemplate} 1fr` : `${baseTemplate} 1fr 1fr`
    }};
    margin: 0;
    padding-bottom: 0;
    padding-left: var(--table-padding-common);
    padding-right: var(--table-padding-common);
    padding-top: 0;

    &:first-child {
      border-top-left-radius: var(--table-border-radius);
      border-top-right-radius: var(--table-border-radius);
    }

    &:last-child {
      border-bottom-left-radius: var(--table-border-radius);
      border-bottom-right-radius: var(--table-border-radius);
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }
  }
`

export const THead = styled(TR)`
  display: none;
  cursor: default;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: grid;

    &:hover {
      background-color: transparent;

      &:active {
        opacity: 1;
      }
    }
  }
`

export const TD = styled.div`
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-start;
  transition: background-color 0.15s linear;
  /* padding: var(--table-padding-common) 0; */

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding-bottom: var(--table-padding-vertical);
    padding-top: var(--table-padding-vertical);
  }
`

export const TH = styled(TD)`
  --th-padding-top: ${({ theme: { common } }) => common.space * 4}px;

  font-size: 1.4rem;
  font-weight: 300;
  padding-top: var(--th-padding-top);
  white-space: nowrap;
`
