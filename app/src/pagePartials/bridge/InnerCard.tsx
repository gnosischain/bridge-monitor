import styled from 'styled-components'

export const InnerCard = styled.div`
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 2) var(--theme-common-space);
  row-gap: calc(var(--theme-common-space) * 2);
  width: 100%;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 3);
  }
`
