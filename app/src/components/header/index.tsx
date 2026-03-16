import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import Link from 'next/link'
import { MenuIcon } from '@/src/components/assets/MenuIcon'
import { GnosisChainLogo } from '@/src/components/assets/GnosisChainLogo'
import { InnerContainer as BaseInnerContainer } from '@/src/components/innerContainer'
import { UserControls } from '@/src/components/header/UserControls'
import { MainMenu } from '@/src/components/navigation/MainMenu'
import { MobileMenu } from '@/src/components/navigation/MobileMenu'

const Wrapper = styled.header`
  align-items: center;
  display: flex;
  flex-grow: 0;
  max-width: 100%;
  padding: calc(var(--theme-common-space) * 4) 0 0 0;
  position: relative;
`

const InnerContainer = styled(BaseInnerContainer)`
  align-items: center;
  flex-direction: row;
  height: auto;
  justify-content: space-between;
  position: relative;
`

const Logo = styled(GnosisChainLogo)`
  cursor: pointer;
  height: 36px;
  margin-right: 2.5rem;

  &:active {
    opacity: 0.7;
  }
`

const FlexEnd = styled.div`
  align-items: center;
  column-gap: 40px;
  display: flex;
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

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeWideStart}) {
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

export const Header: React.FC = (props) => {
  const [isOpen, toggleOpen] = useState(false)
  const { isWalletConnected, isWalletNetworkSupported } = useWeb3Connection()

  useEffect(() => {
    // Fix me later
    if (isOpen) {
      window.document.body.style.overflow = 'hidden'
    } else {
      window.document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      <Wrapper {...props}>
        <InnerContainer>
          <Link href="/" passHref>
            <Logo />
          </Link>
          <FlexEnd>
            <MainMenu />
            <UserControls />
            <MenuButton
              onClick={() => {
                toggleOpen(true)
              }}
            >
              <MenuIcon />
              {isWalletConnected && !isWalletNetworkSupported && <Status />}
            </MenuButton>
          </FlexEnd>
        </InnerContainer>
      </Wrapper>
      {isOpen && <MobileMenu closeMenu={() => toggleOpen(false)} />}
    </>
  )
}
