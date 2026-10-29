import styled, { css } from 'styled-components'

import { EyebrowCSS } from '@/src/components/text/Eyebrow'

export const ListCard = styled.div`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  min-width: 0;
`

// Shared by the header and the rows so their columns line up.
export const ListColumnsCSS = css`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    align-items: center;
    column-gap: calc(var(--theme-common-space) * 2);
    display: grid;
    grid-template-columns:
      minmax(190px, 1.6fr) repeat(3, minmax(88px, 1fr)) minmax(130px, 1.1fr)
      minmax(170px, 1.2fr);
    padding: 0 calc(var(--theme-common-space) * 3);
  }
`

export const ListHead = styled.div`
  display: none;

  ${ListColumnsCSS}

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
    padding-bottom: calc(var(--theme-common-space) * 1.5);
    padding-top: calc(var(--theme-common-space) * 2);
  }
`

export const ListHeading = styled.span`
  ${EyebrowCSS}

  white-space: nowrap;
`

export const ListRows = styled.div`
  display: flex;
  flex-direction: column;

  > * + * {
    border-top: 1px solid ${({ theme: { colors } }) => colors.line};
  }
`

export const CellLabel = styled(ListHeading)`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: none;
  }
`
