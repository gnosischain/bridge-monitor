import styled from 'styled-components'

export const MainCard = styled.div`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 2) var(--theme-common-space);
  row-gap: calc(var(--theme-common-space) * 3);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2)
      calc(var(--theme-common-space) * 3);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding: calc(var(--theme-common-space) * 5) calc(var(--theme-common-space) * 3)
      calc(var(--theme-common-space) * 3);
    row-gap: calc(var(--theme-common-space) * 4);
  }
`
