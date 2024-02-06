import styled from 'styled-components'

import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'
import { mainMenuSections } from '@/src/constants/sections'

const Wrapper = styled.nav`
  display: none;
  height: 100%;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    align-items: center;
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
    column-gap: calc(var(--theme-common-space) * 3);
    display: flex;
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    column-gap: calc(var(--theme-common-space) * 5);
    display: flex;
  }
`
const NavLink = styled(BaseNavLink)`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 1.4rem;
  height: 100%;
  justify-content: center;
  text-decoration: none;
  transition: text-shadow 0.25s ease-in-out;

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    font-size: 1.6rem;
  }

  &:active {
    opacity: 0.7;
  }

  &.active {
    pointer-events: none;
    text-shadow: 0 0 1px ${({ theme: { colors } }) => colors.primary};
  }
`

export const MainMenu: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {mainMenuSections.map(({ href, section }, index) => (
        <NavLink href={href} key={`links_${index}`}>
          {section}
        </NavLink>
      ))}
    </Wrapper>
  )
}
