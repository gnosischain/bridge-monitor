import styled from 'styled-components'

import { Sidebar as BaseSidebar } from '@/src/components/sidebarLayout/Sidebar'
import { InnerContainer } from '@/src/components/innerContainer'

type SidebarPlacement = 'right' | 'left' | undefined

const Wrapper = styled(InnerContainer).withConfig({
  shouldForwardProp: (prop) => !['sidebarPlacement'].includes(prop),
})<{ sidebarPlacement?: SidebarPlacement }>`
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

const Sidebar = styled(BaseSidebar).withConfig({
  shouldForwardProp: (prop) => !['sidebarPlacement', 'className'].includes(prop),
})<{ sidebarPlacement?: SidebarPlacement; className?: string }>`
  order: 1;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
    order: ${({ sidebarPlacement }) => (sidebarPlacement === 'left' ? '0' : '1')};
  }
`

Sidebar.defaultProps = {
  className: 'sidebar',
}

const Header = styled.div`
  grid-column: 1 / -1;
  order: -1;
  padding-bottom: var(--theme-common-space);
`

const Main = styled.div.withConfig({
  shouldForwardProp: (prop) => !['sidebarPlacement'].includes(prop),
})<{ sidebarPlacement?: SidebarPlacement }>`
  order: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
    order: ${({ sidebarPlacement }) => (sidebarPlacement === 'left' ? '1' : '0')};
  }
`

Main.defaultProps = {
  className: 'main',
}

interface Props {
  children?: React.ReactNode
  $header?: React.ReactNode
  $sidebarContents: React.ReactNode
  $sidebarPlacement?: SidebarPlacement
}

export const SidebarLayout: React.FC<Props> = ({
  $header,
  $sidebarContents,
  $sidebarPlacement = 'right',
  children,
  ...restProps
}) => (
  <Wrapper sidebarPlacement={$sidebarPlacement} {...restProps}>
    {$header && <Header>{$header}</Header>}
    <Main as="main" sidebarPlacement={$sidebarPlacement}>
      {children}
    </Main>
    <Sidebar sidebarPlacement={$sidebarPlacement}>{$sidebarContents}</Sidebar>
  </Wrapper>
)
