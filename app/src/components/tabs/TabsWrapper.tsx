import styled from 'styled-components'

export const TabsWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.darkestGrey2};
  margin: 0 ${({ theme: { common } }) => common.space * -2}px
    ${({ theme: { common } }) => common.space * 2}px;
  overflow-x: auto;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin-bottom: ${({ theme: { common } }) => common.space * 4}px;
  }
`
