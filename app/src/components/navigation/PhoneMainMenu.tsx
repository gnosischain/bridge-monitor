import Image from 'next/image'
import styled from 'styled-components'

import { motion } from 'framer-motion'

import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'
import { sections } from '@/src/constants/sections'

const Wrapper = styled.div`
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
`
const MenuBackground = styled.div`
  background-color: ${({ theme: { colors } }) => colors.black};
  cursor: pointer;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
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
  align-items: center;
  border-bottom: 1px solid rgba(256, 256, 256, 0.1);
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme: { common } }) => common.space * 4}px;
  min-height: 100px;
  width: 100%;
`
const H2 = styled.h2`
  font-weight: 400;
  margin: 0;
`

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: block;
  padding: 0;
  position: relative;
  width: 24px;
`
const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space}px;
  width: 100%;
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
            {sections.map(({ href, section }, index) => (
              <NavLink href={href} key={`links_${index}`} onClick={() => closeMenu()}>
                {section}
              </NavLink>
            ))}
          </Nav>
        </Menu>
      </MenuWrapper>
    </Wrapper>
  )
}
