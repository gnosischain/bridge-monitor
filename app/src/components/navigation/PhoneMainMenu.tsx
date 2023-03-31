import Image from 'next/image'
import styled from 'styled-components'

import { motion } from 'framer-motion'

import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'
import { sections } from '@/src/constants/sections'

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`
const MenuBackground = styled.div`
  background-color: ${({ theme: { colors } }) => colors.black};
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  z-index: 10;
`
const Menu = styled.div`
  align-items: flex-start;
  color: ${({ theme }) => theme.colors.cream};
  display: flex;
  flex-direction: column;
`
const MenuWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.darkestGrey};
  position: absolute;
  top: 0;
  right: 0;
  height: 100vh;
  padding: 0 ${({ theme: { common } }) => common.space * 2}px
    ${({ theme: { common } }) => common.space * 2}px;
  overflow-y: auto;
  width: 660px;
  max-width: 94%;
  z-index: 20;
  box-shadow: 59.8671px 3.99114px 121px rgba(0, 0, 0, 0.07),
    30.3077px 2.02051px 52.7484px rgba(0, 0, 0, 0.04725),
    11.9734px 0.798228px 19.6625px rgba(0, 0, 0, 0.035),
    2.61919px 0.174612px 6.99531px rgba(0, 0, 0, 0.02275);
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: 0 ${({ theme: { common } }) => common.space * 4}px
      ${({ theme: { common } }) => common.space * 4}px;
  }
`
const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 100px;
  border-bottom: 1px solid rgba(256, 256, 256, 0.1);
  margin-bottom: ${({ theme: { common } }) => common.space * 4}px;
`
const H2 = styled.h2`
  font-weight: 400;
  margin: 0;
`

const CloseButton = styled.button`
  background-color: transparent;
  display: block;
  padding: 0;
  border: none;
  width: 24px;
  cursor: pointer;
  position: relative;
`
const Nav = styled.nav`
  display: block;
  width: 100%;
  ul {
    margin: 0;
    li {
      margin: 0 0 ${({ theme: { common } }) => common.space}px;
    }
  }
`
const NavLink = styled(BaseNavLink)`
  color: ${({ theme: { colors } }) => colors.white};
  text-decoration: none;
  display: flex;
  padding: ${({ theme: { common } }) => common.space}px
    ${({ theme: { common } }) => common.space * 2}px;
  font-size: 1.6rem;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  &.active {
    background-color: ${({ theme: { colors } }) => colors.primary};
  }
  &:hover {
    background-color: ${({ theme: { colors } }) => colors.primary};
    color: ${({ theme: { colors } }) => colors.white};
  }
`

interface Props {
  closeMenu: () => void
}
export const PhoneMainMenu: React.FC<Props> = ({ closeMenu }) => {
  return (
    <Wrapper>
      <MenuBackground
        animate={{ opacity: 0.6 }}
        as={motion.div}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={() => closeMenu()}
        transition={{ duration: 0.1, type: 'spring', stiffness: 1000, damping: 100 }}
      />
      <MenuWrapper
        animate={{ opacity: 1, x: '0' }}
        as={motion.div}
        exit={{ opacity: 0, x: '150px' }}
        initial={{ opacity: 0, x: '150px' }}
        transition={{ duration: 0.1, type: 'spring', stiffness: 1000, damping: 100 }}
      >
        <Menu>
          <MenuHeader>
            <H2>Menu</H2>
            <CloseButton onClick={() => closeMenu()}>
              <Image alt="Alerts" height={24} src="/images/icon-close.svg" width={24} />
            </CloseButton>
          </MenuHeader>
          <Nav>
            <ul>
              {sections.map(({ href, section }, index) => (
                <li key={`links_${index}`}>
                  <NavLink href={href} onClick={() => closeMenu()}>
                    {section}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Nav>
        </Menu>
      </MenuWrapper>
    </Wrapper>
  )
}
