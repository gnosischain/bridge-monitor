import styled, { css } from 'styled-components'
import { motion } from 'framer-motion'
import { NavLink as BaseNavLink } from '@/src/components/navigation/NavLink'
import { mainMenuSections, myTransactionsFullURL } from '@/src/constants/sections'
import { Disconnect } from '@/src/components/assets/Disconnect'
import { SwitchNetwork } from '@/src/components/assets/SwitchNetwork'
import { ModalSwitchNetwork } from '@/src/components/modal/ModalSwitchNetwork'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useRouter } from 'next/router'
import { ButtonPrimary } from '@/src/components/buttons/Button'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { MyTransactions } from '@/src/components/assets/MyTransactions'
import { GnosisChainLogo } from '@/src/components/assets/GnosisChainLogo'
import { Eyebrow } from '@/src/components/text/Eyebrow'

const Wrapper = styled.div`
  inset: 0;
  overflow: hidden;
  position: fixed;
  z-index: 100;
`

const MenuBackground = styled.div`
  background-color: ${({ theme: { modal } }) => modal.overlayColor};
  cursor: pointer;
  inset: 0;
  position: absolute;
  z-index: 10;
`

const MenuWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.mist};
  border-left: 1px solid ${({ theme: { colors } }) => colors.line};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 2);
  position: absolute;
  right: 0;
  top: 0;
  width: min(88vw, 380px);
  z-index: 20;
`

const MenuHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
  display: flex;
  flex-shrink: 0;
  height: 64px;
  justify-content: space-between;
  margin-bottom: var(--theme-common-space);
  width: 100%;
`

const Logo = styled(GnosisChainLogo)`
  height: 22px;
  width: auto;
`

const CloseButton = styled.button`
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
  width: 40px;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};
  }
`

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  row-gap: 2px;
  width: 100%;
`

const ButtonCSS = css`
  align-items: center;
  background-color: transparent;
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { colors } }) => colors.fog};
  display: flex;
  font-size: 1.6rem;
  min-height: 44px;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 1.5);
  text-decoration: none;

  svg {
    .fill,
    path {
      fill: currentColor;
    }
  }

  &.active {
    background-color: ${({ theme: { colors } }) => colors.surface};
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 500;
  }

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.surface};
    color: ${({ theme: { colors } }) => colors.ink};
  }
`

const NavLink = styled(BaseNavLink)`
  ${ButtonCSS}
`

const UserMenu = styled.div`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding: calc(var(--theme-common-space) * 2) var(--theme-common-space) var(--theme-common-space);
  row-gap: 2px;
`

const Connected = styled.div`
  color: ${({ theme: { colors } }) => colors.ink};
  display: flex;
  flex-direction: column;
  padding: 0 calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 1.5);
  row-gap: 6px;
`

const ConnectedText = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: 10px;
  display: flex;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
`

const UserButton = styled.button`
  ${ButtonCSS}

  border: none;
  column-gap: 6px;
  cursor: pointer;
  font-size: 1.5rem;
  justify-content: space-between;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.page};
  }
`

const ButtonConnect = styled(ButtonPrimary)`
  flex-shrink: 0;
  font-size: 1.5rem;
  height: 48px;
  margin-top: auto;
  padding: 0 calc(var(--theme-common-space) * 2);
`

const Status = styled.div`
  --ball-dimensions: 8px;

  background-color: ${({ theme: { colors } }) => colors.error};
  border-radius: 50%;
  height: var(--ball-dimensions);
  margin-right: auto;
  width: var(--ball-dimensions);
`

const UnsupportedNetworkLabel = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.error};
  column-gap: 8px;
  display: flex;
`

interface Props {
  closeMenu: () => void
}

export const MobileMenu: React.FC<Props> = ({ closeMenu, ...restProps }) => {
  const {
    address,
    connectWallet,
    disconnectWallet,
    getExplorerUrl,
    isWalletConnected,
    isWalletNetworkSupported,
  } = useWeb3Connection()
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    disconnectWallet()
    closeMenu()
  }

  const handleConnect = () => {
    closeMenu()
    return connectWallet()
  }

  return (
    <AnimatePresence>
      <Wrapper {...restProps}>
        <MenuBackground
          animate={{ opacity: 1 }}
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
          <MenuHeader>
            <Logo />
            <CloseButton aria-label="Close menu" onClick={() => closeMenu()}>
              <svg
                fill="none"
                height="24"
                viewBox="0 0 25 24"
                width="25"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="m18.6285 6-11.99996 12" />
                  <path d="m6.62854 6 11.99996 12" />
                </g>
              </svg>
            </CloseButton>
          </MenuHeader>
          <Nav>
            {mainMenuSections.map(({ href, section }, index) => (
              <NavLink href={href} key={`links_${index}`} onClick={() => closeMenu()}>
                {section}
              </NavLink>
            ))}
          </Nav>
          {isWalletConnected ? (
            <UserMenu>
              <Connected>
                <Eyebrow>Connected wallet</Eyebrow>
                <ConnectedText>
                  {address && (
                    <TokenAddress
                      address={address}
                      characters={4}
                      copy
                      href={getExplorerUrl(address)}
                      useDomain
                    />
                  )}
                </ConnectedText>
              </Connected>
              <UserButton onClick={() => setShowNetworkModal(true)}>
                {isWalletNetworkSupported ? (
                  'Switch Network'
                ) : (
                  <UnsupportedNetworkLabel>
                    Switch To A Valid Network <Status />
                  </UnsupportedNetworkLabel>
                )}
                <SwitchNetwork />
              </UserButton>
              <UserButton
                onClick={() => {
                  router.push(`${myTransactionsFullURL}${address}`)
                  closeMenu()
                }}
              >
                My Transactions
                <MyTransactions />
              </UserButton>
              <UserButton onClick={handleLogout}>
                Log Out
                <Disconnect />
              </UserButton>
            </UserMenu>
          ) : (
            <ButtonConnect onClick={handleConnect}>Connect</ButtonConnect>
          )}
        </MenuWrapper>
      </Wrapper>
      {showNetworkModal && <ModalSwitchNetwork onClose={() => setShowNetworkModal(false)} />}
    </AnimatePresence>
  )
}
