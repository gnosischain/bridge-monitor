import styled from 'styled-components'

export const InnerCard = styled.div`
  background: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 2);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2);
  }
`
