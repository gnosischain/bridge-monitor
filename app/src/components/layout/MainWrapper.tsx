import styled from 'styled-components'

export const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-bottom: var(--theme-layout-vertical-padding);
  padding-top: var(--theme-layout-vertical-padding);
  row-gap: calc(var(--theme-common-space) * 6);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-bottom: var(--theme-layout-vertical-padding-xl);
    padding-top: var(--theme-layout-vertical-padding-xl);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding-bottom: var(--theme-layout-vertical-padding-xl);
    padding-top: var(--theme-layout-vertical-padding-xxl);
  }
`
