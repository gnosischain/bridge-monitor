import styled from 'styled-components'

export const Tabs = styled.nav`
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkerGrey};
  display: flex;
  padding-right: calc(var(--theme-common-space) * 2);
`

export const TabContentInner = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 32px;
`

export const TabsWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.darkestGrey2};
  margin: 0 calc(var(--theme-common-space) * -2) calc(var(--theme-common-space) * 2);
  overflow-x: auto;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin-bottom: calc(var(--theme-common-space) * 3);
  }
`
