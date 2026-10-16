import styled from 'styled-components'

export const Card = styled.div`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: calc(var(--theme-common-space) * 2.5);
  row-gap: calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 3);
  }
`
