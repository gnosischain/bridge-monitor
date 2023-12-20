import styled from 'styled-components'
import { bridgeExplorerSections } from '@/src/constants/sections'
import { BridgeSidebar } from '@/src/pagePartials/bridge/BridgeSidebar'
import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  row-gap: ${({ theme: { common } }) => common.space}px;
`

const NavLink = styled(BaseNavLink)`
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme: { colors } }) => colors.white};
  display: flex;
  font-size: 1.6rem;
  padding: ${({ theme: { common } }) => common.space}px
    ${({ theme: { common } }) => common.space * 2}px;
  text-decoration: none;

  &.active {
    background-color: ${({ theme: { colors } }) => colors.primary};
  }

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.primary};
    color: ${({ theme: { colors } }) => colors.white};
  }
`

export const Sidebar: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <BridgeSidebar />
      {bridgeExplorerSections.map(({ href, section }, index) => (
        <NavLink href={href} key={`sidebar_links_${index}`}>
          {section}
        </NavLink>
      ))}
    </Wrapper>
  )
}
