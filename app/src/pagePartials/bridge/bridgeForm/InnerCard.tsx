import styled from 'styled-components'
import { AmountInputWrapper } from '@/src/pagePartials/bridge/bridgeForm/AmountTokenInput'

// One side of the transfer: a tinted panel inside the white form card. The border lights up while
// the amount is typed, the amount field having no border of its own (the switch button and the
// token search also sit inside the "From" panel, and should not light it up).
export const InnerCard = styled.div`
  background: ${({ theme: { colors } }) => colors.page};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 1.5);
  transition: border-color 0.15s linear;
  width: 100%;

  &:has(${AmountInputWrapper} input:focus) {
    border-color: ${({ theme: { colors } }) => colors.violet};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2.5);
  }
`
