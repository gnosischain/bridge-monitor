/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { ButtonPrimary } from '@/src/components/buttons/Button'
import { UserDropdown as BaseUserDropdown } from '@/src/components/common/UserDropdown'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { MenuIcon } from '@/src/components/assets/MenuIcon'
import { GnosisChainLogo } from '@/src/components/common/Logo'
import { InnerContainer as BaseInnerContainer } from '@/src/components/helpers/InnerContainer'
import { PhotoBackground } from '@/src/components/layout/PhotoBackground'
import { MainMenu as BaseMainMenu } from '@/src/components/navigation/MainMenu'
import { MobileMenu } from '@/src/components/navigation/MobileMenu'

const Wrapper = styled.header`
  align-items: center;
  display: flex;
  flex-grow: 0;
  margin-bottom: 5vh;
  max-width: 100%;
  position: relative;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    margin-bottom: 8vh;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    margin-bottom: 12vh;
  }

  &:after {
    background-color: ${({ theme: { colors } }) => colors.white};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    opacity: 0.1;
    position: absolute;
    width: 100%;
  }
`

const ResponsiveCSS = css`
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    display: flex;
  }
`

const InnerContainer = styled(BaseInnerContainer)`
  flex-direction: row;
  justify-content: space-between;
  height: ${({ theme: { header } }) => header.height};
  position: relative;
`

const Start = styled.div`
  align-items: center;
  display: flex;
  position: relative;
  z-index: 5;
`

const Logo = styled(GnosisChainLogo)`
  cursor: pointer;
  max-height: calc(${({ theme: { header } }) => header.height});
  height: 50px;

  &:active {
    opacity: 0.7;
  }
`

const End = styled.div`
  align-items: center;
  display: flex;
  position: relative;
  z-index: 5;
`

const MainMenu = styled(BaseMainMenu)`
  ${ResponsiveCSS}
  height: calc(${({ theme: { header } }) => header.height});
  justify-content: center;
  left: 0;
  position: absolute;
  width: 100%;
  z-index: 1;
`

const UserDropdown = styled(BaseUserDropdown)`
  ${ResponsiveCSS}
`

const ButtonConnect = styled(ButtonPrimary)`
  ${ResponsiveCSS}
  font-size: 1.5rem;
  padding: 10px 16px;
`

const MenuButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.white};
  cursor: pointer;
  display: block;
  padding: 0;
  position: relative;
  width: 24px;

  &:hover {
    color: ${({ theme: { colors } }) => colors.secondary};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    display: none;
  }
`

const Status = styled.div`
  --status-size: 10px;

  background-color: ${({ theme: { colors } }) => colors.error};
  border-radius: 50%;
  top: -4px;
  height: var(--status-size);
  right: -4px;
  position: absolute;
  width: var(--status-size);
  z-index: 5;
`

const UserControls: React.FC = () => {
  const { connectWallet, isWalletConnected } = useWeb3Connection()

  return isWalletConnected ? (
    <UserDropdown />
  ) : (
    <ButtonConnect onClick={connectWallet}>Connect Wallet</ButtonConnect>
  )
}

export const Header: React.FC = (props) => {
  const [isOpen, toggleOpen] = useState(false)
  const { isWalletConnected, isWalletNetworkSupported } = useWeb3Connection()

  useEffect(() => {
    // Fix me later
    if (isOpen) window.document.body.style.overflow = 'hidden'
    if (!isOpen) {
      window.document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      <PhotoBackground />
      <Wrapper {...props}>
        <InnerContainer>
          <Start>
            <Link href="/" passHref>
              <a>
                <Logo />
              </a>
            </Link>
          </Start>
          <MainMenu />
          <End>
            <UserControls />
            <MenuButton
              onClick={() => {
                toggleOpen(true)
              }}
            >
              <MenuIcon />
              {isWalletConnected && !isWalletNetworkSupported && <Status />}
            </MenuButton>
          </End>
        </InnerContainer>
      </Wrapper>
      <AnimatePresence>
        {isOpen && <MobileMenu closeMenu={() => toggleOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
