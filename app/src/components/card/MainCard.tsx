import styled from 'styled-components'

export const MainCard = styled.div<{ backgroundOpacity?: string }>`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 16px;
  box-shadow: 0px 2.231px 2.775px 0px rgba(0, 0, 0, 0.01), 0px 10.2px 7.8px 0px rgba(0, 0, 0, 0.01),
    0px 25.819px 20.925px 0px rgba(0, 0, 0, 0.02), 0px 51px 48px 0px rgba(0, 0, 0, 0.03);
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
