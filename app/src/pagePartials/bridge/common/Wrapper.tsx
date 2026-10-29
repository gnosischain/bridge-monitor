import styled from 'styled-components'

import { MainCard } from '@/src/components/card/MainCard'

export const Wrapper = styled(MainCard)`
  padding: calc(var(--theme-common-space) * 2.5) calc(var(--theme-common-space) * 2)
    calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 2.5);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    padding: calc(var(--theme-common-space) * 3);
    row-gap: calc(var(--theme-common-space) * 3);
  }
`
