import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import Link from 'next/link'
import { MenuIcon } from '@/src/components/assets/MenuIcon'
import { GnosisChainLogo } from '@/src/components/assets/GnosisChainLogo'
import { UserControls } from '@/src/components/header/UserControls'
import { MainMenu } from '@/src/components/navigation/MainMenu'
import { MobileMenu } from '@/src/components/navigation/MobileMenu'

const Wrapper = styled.header<{ $solid: boolean }>`
  align-items: center;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  flex-shrink: 0;
  height: 52px;
  justify-content: space-between;
  margin: var(--theme-common-space) auto 0;
  max-width: calc(${({ theme }) => theme.layout.maxWidth} - 48px);
  padding: 0 var(--theme-common-space) 0 calc(var(--theme-common-space) * 2);
  position: sticky;
  top: var(--theme-common-space);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
  width: calc(100% - var(--theme-common-space) * 2);
  z-index: 30;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    column-gap: calc(var(--theme-common-space) * 3);
    height: 56px;
    margin-top: calc(var(--theme-common-space) * 1.5);
    padding: 0 calc(var(--theme-common-space) * 1.5) 0 calc(var(--theme-common-space) * 3);
    top: calc(var(--theme-common-space) * 1.5);
    width: calc(100% - var(--theme-common-space) * 6);
  }

  ${({ $solid }) =>
    $solid &&
    css`
      background-color: ${({ theme: { colors } }) => colors.surface};
      border-color: ${({ theme: { colors } }) => colors.line};
      box-shadow: 0 8px 24px -16px rgba(7, 5, 44, 0.25);
    `}
`

const HomeLink = styled(Link)`
  display: flex;
  flex-shrink: 0;

  &:active {
    opacity: 0.7;
  }
`

const Logo = styled(GnosisChainLogo)`
  height: 22px;
  width: auto;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    height: 26px;
  }
`

const FlexEnd = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
`

const MenuButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  color: ${({ theme: { colors } }) => colors.ink};
  cursor: pointer;
  display: flex;
  height: 40px;
  justify-content: center;
  padding: 0;
  position: relative;
  width: 40px;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: none;
  }
`

const Status = styled.div`
  --status-size: 10px;

  background-color: ${({ theme: { colors } }) => colors.error};
  border-radius: 50%;
  top: 6px;
  height: var(--status-size);
  right: 4px;
  position: absolute;
  width: var(--status-size);
  z-index: 5;
`

export const Header: React.FC = (props) => {
  const [isOpen, toggleOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { isWalletConnected, isWalletNetworkSupported } = useWeb3Connection()

  useEffect(() => {
    // TODO: fix me later
    if (isOpen) {
      window.document.body.style.overflow = 'hidden'
    } else {
      window.document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <Wrapper $solid={solid} {...props}>
        <HomeLink aria-label="Gnosis Bridge home" href="/">
          <Logo />
        </HomeLink>
        <FlexEnd>
          <MainMenu />
          <UserControls />
          <MenuButton
            aria-label="Open menu"
            onClick={() => {
              toggleOpen(true)
            }}
          >
            <MenuIcon />
            {isWalletConnected && !isWalletNetworkSupported && <Status />}
          </MenuButton>
        </FlexEnd>
      </Wrapper>
      {isOpen && <MobileMenu closeMenu={() => toggleOpen(false)} />}
    </>
  )
}
