import styled from 'styled-components'

import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'
import { sections } from '@/src/constants/sections'

const Nav = styled.nav`
  height: 100%;

  ul {
    height: 100%;
    margin: 0 ${({ theme: { common } }) => common.space * -1}px;

    li {
      align-items: center;
      display: inline-flex;
      height: 100%;
      padding: 0 ${({ theme: { common } }) => common.space}px;
    }
  }
`
const NavLink = styled(BaseNavLink)`
  align-items: center;
  border-bottom: 1px solid transparent;
  color: ${({ theme: { colors } }) => colors.white};
  display: flex;
  font-size: 1.2rem;
  height: 100%;
  justify-content: center;
  padding: 0 ${({ theme: { common } }) => common.space / 2}px;
  position: relative;
  text-decoration: none;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 1.3rem;
    padding: 0 ${({ theme: { common } }) => common.space}px;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    font-size: 1.6rem;
    padding: 0 ${({ theme: { common } }) => common.space * 2}px;
  }

  &.active {
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.white};
  }

  &:hover {
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.secondary};
    color: ${({ theme: { colors } }) => colors.secondary};
  }
`

export const MainMenu: React.FC = ({ ...restProps }) => {
  return (
    <Nav {...restProps}>
      <ul>
        {sections.map(({ href, section }, index) => (
          <li key={`links_${index}`}>
            <NavLink href={href}>{section}</NavLink>
          </li>
        ))}
      </ul>
    </Nav>
  )
}
