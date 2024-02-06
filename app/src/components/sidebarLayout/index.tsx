import styled from 'styled-components'

import { Sidebar as BaseSidebar } from '@/src/components/sidebarLayout/Sidebar'
import { InnerContainer } from '@/src/components/innerContainer'

type SidebarPlacement = 'right' | 'left' | undefined

const Wrapper = styled(InnerContainer)<{ sidebarPlacement?: SidebarPlacement }>`
  --sidebar-width: 456px;
  --sidebar-width-tablet: 340px;

  display: grid;
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
    column-gap: calc(var(--theme-common-space) * 2);
    flex-grow: 1;
    grid-template-columns: ${({ sidebarPlacement }) =>
      sidebarPlacement === 'left' ? 'var(--sidebar-width) 1fr' : '1fr var(--sidebar-width-tablet)'};
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    grid-template-columns: ${({ sidebarPlacement }) =>
      sidebarPlacement === 'left' ? 'var(--sidebar-width) 1fr' : '1fr var(--sidebar-width)'};
  }
`

const Sidebar = styled(BaseSidebar)<{ sidebarPlacement?: SidebarPlacement }>`
  order: 1;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
    order: ${({ sidebarPlacement }) => (sidebarPlacement === 'left' ? '0' : '1')};
  }
`

const Main = styled.div<{ sidebarPlacement?: SidebarPlacement }>`
  order: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
    order: ${({ sidebarPlacement }) => (sidebarPlacement === 'left' ? '1' : '0')};
  }
`

interface Props {
  sidebarContents: React.ReactNode
  sidebarPlacement?: SidebarPlacement
}

export const SidebarLayout: React.FC<Props> = ({
  children,
  sidebarContents,
  sidebarPlacement = 'right',
  ...restProps
}) => (
  <Wrapper sidebarPlacement={sidebarPlacement} {...restProps}>
    <Main as="main" sidebarPlacement={sidebarPlacement}>
      {children}
    </Main>
    <Sidebar sidebarPlacement={sidebarPlacement}>{sidebarContents}</Sidebar>
  </Wrapper>
)
