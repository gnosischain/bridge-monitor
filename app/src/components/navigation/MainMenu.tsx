import styled from 'styled-components'

import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'
import { mainMenuSections } from '@/src/constants/sections'

const Wrapper = styled.nav`
  align-items: center;
  column-gap: 2px;
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: flex;
  }
`

const NavLink = styled(BaseNavLink)`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  display: flex;
  font-size: 1.4rem;
  height: 32px;
  padding: 0 calc(var(--theme-common-space) * 1);
  text-decoration: none;
  white-space: nowrap;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    font-size: 1.5rem;
    padding: 0 calc(var(--theme-common-space) * 1.25);
  }

  &:hover {
    color: ${({ theme: { colors } }) => colors.ink};
  }

  &:active {
    opacity: 0.7;
  }

  &.active {
    color: ${({ theme: { colors } }) => colors.ink};
    pointer-events: none;
  }
`

export const MainMenu: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper aria-label="Main" {...restProps}>
      {mainMenuSections.map(({ href, section }, index) => (
        <NavLink href={href} key={`links_${index}`}>
          {section}
        </NavLink>
      ))}
    </Wrapper>
  )
}
