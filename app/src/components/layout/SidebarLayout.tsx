import styled from 'styled-components'

import { MainWrapper } from '@/src/components/layout/MainWrapper'
import { Sidebar as BaseSidebar } from '@/src/components/layout/Sidebar'
import { InnerContainer } from '@/src/components/helpers/InnerContainer'

export type SidebarPlacement = 'right' | 'left' | undefined

interface Props {
  sidebarPlacement?: SidebarPlacement
}

const Wrapper = styled(InnerContainer)<Props>`
  --sidebar-width: 456px;

  display: grid;
  row-gap: 20px;
  padding-bottom: var(--theme-layout-vertical-padding);
  padding-top: var(--theme-layout-vertical-padding);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    column-gap: 16px;
    flex-grow: 1;
    grid-template-columns: ${({ sidebarPlacement }) =>
      sidebarPlacement === 'left' ? 'var(--sidebar-width) 1fr' : '1fr var(--sidebar-width)'};
  }
`

const Sidebar = styled(BaseSidebar)<Props>`
  order: 1;
  padding: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    order: ${({ sidebarPlacement }) => (sidebarPlacement === 'left' ? '0' : '1')};
  }
`

const Main = styled(MainWrapper)<Props>`
  order: 0;
  padding: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    order: ${({ sidebarPlacement }) => (sidebarPlacement === 'left' ? '1' : '0')};
  }
`

export const SidebarLayout: React.FC<Props> = ({
  children,
  sidebarPlacement = 'right',
  ...restProps
}) => (
  <Wrapper sidebarPlacement={sidebarPlacement} {...restProps}>
    <Main as="main" sidebarPlacement={sidebarPlacement}>
      {children}
    </Main>
    <Sidebar sidebarPlacement={sidebarPlacement} />
  </Wrapper>
)
