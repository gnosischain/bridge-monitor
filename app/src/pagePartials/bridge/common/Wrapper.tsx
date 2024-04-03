import styled from 'styled-components'

import { MainCard } from '@/src/components/card/MainCard'

export const Wrapper = styled(MainCard)`
  align-items: center;
  padding-top: calc(var(--theme-common-space) * 5);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-top: calc(var(--theme-common-space) * 8);
  }
`
