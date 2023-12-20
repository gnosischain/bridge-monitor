import styled from 'styled-components'

export const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-bottom: var(--layout-vertical-padding);
  padding-top: var(--layout-vertical-padding);
  row-gap: ${({ theme: { common } }) => common.space * 6}px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-bottom: var(--layout-vertical-padding-xl);
    padding-top: var(--layout-vertical-padding-xl);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding-bottom: var(--layout-vertical-padding-xl);
    padding-top: var(--layout-vertical-padding-xxl);
  }
`
