import styled from 'styled-components'

export const Tabs = styled.nav`
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkerGrey};
  display: flex;
  padding-right: ${({ theme: { common } }) => common.space * 2}px;
`

export const TabContentInner = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 32px;
`

export const TabsWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.darkestGrey2};
  margin: 0 ${({ theme: { common } }) => common.space * -2}px
    ${({ theme: { common } }) => common.space * 2}px;
  overflow-x: auto;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin-bottom: ${({ theme: { common } }) => common.space * 3}px;
  }
`
