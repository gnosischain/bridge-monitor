import styled from 'styled-components'

import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'
import { sections } from '@/src/constants/sections'

const Wrapper = styled.nav`
  display: none;
  height: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    align-items: center;
    column-gap: 40px;
    display: flex;
  }
`
const NavLink = styled(BaseNavLink)`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.white};
  display: flex;
  font-size: 1.4rem;
  height: 100%;
  justify-content: center;
  opacity: 0.6;
  text-decoration: none;

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    font-size: 1.6rem;
  }

  &.active,
  &:hover {
    opacity: 1;
  }

  &:active {
    opacity: 0.7;
  }

  &.active {
    pointer-events: none;
  }
`

export const MainMenu: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {sections.map(({ href, section }, index) => (
        <NavLink href={href} key={`links_${index}`}>
          {section}
        </NavLink>
      ))}
    </Wrapper>
  )
}
