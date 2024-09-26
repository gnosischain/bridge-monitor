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

const Wrapper = styled.div`
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100vw;
`

const MenuBackground = styled.div`
  background-color: ${({ theme: { modal } }) => modal.overlayColor};
  cursor: pointer;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
`

const MenuWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  box-shadow: -10px 0 30px 5px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: calc(var(--theme-common-space) * 4) calc(var(--theme-common-space) * 3);
  max-width: 94%;
  position: absolute;
  right: 0;
  top: 0;
  width: 660px;
  z-index: 20;
`

const MenuHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.primary_50};
  display: flex;
  justify-content: space-between;
  margin-bottom: calc(var(--theme-common-space) * 4);
  padding-bottom: calc(var(--theme-common-space) * 2);
  width: 100%;
`

const Title = styled.h2`
  font-weight: 400;
  margin: 0;
`

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  display: block;
  padding: 0;
  position: relative;
  width: 24px;
`

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  row-gap: var(--theme-common-space);
  width: 100%;
`

const ButtonCSS = css`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  min-height: 40px;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 2);
  text-decoration: none;

  svg {
    .fill,
    path {
      fill: ${({ theme: { colors } }) => colors.primary};
    }
  }

  &.active {
    background-color: ${({ theme: { colors } }) => colors.creamDark};
  }

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.creamDark};
    color: ${({ theme: { colors } }) => colors.white};

    svg {
      .fill,
      path {
        fill: ${({ theme: { colors } }) => colors.white};
      }
    }
  }
`

const NavLink = styled(BaseNavLink)`
  ${ButtonCSS}

  background-color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.6rem;
  font-weight: 500;
`

const UserMenu = styled.div`
  background: linear-gradient(
    180deg,
    ${({ theme: { colors } }) => colors.cream} 0%,
    ${({ theme: { colors } }) => colors.creamDark} 100%
  );
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: var(--theme-common-space);
`

const Connected = styled.div`
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
  row-gap: 5px;
`

const ConnectedTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
`

const ConnectedText = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: 10px;
  display: flex;
  font-size: 1.4rem;
  line-height: 1.2;
`

const UserButton = styled.button`
  ${ButtonCSS}

  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream};
  border: none;
  column-gap: 6px;
  font-size: 1.5rem;
  justify-content: space-between;
`

const ButtonConnect = styled(ButtonPrimary)`
  font-size: 1.5rem;
  margin-top: auto;
  padding: 10px 16px;
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

  const handleLogout = async () => {
    try {
      await disconnectWallet()
      router.push(`/`)
      closeMenu()
    } catch (e) {
      console.error('Error disconnecting wallet', e)
    }
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
            <Title>Menu</Title>
            <CloseButton onClick={() => closeMenu()}>
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
                <ConnectedTitle>Connected wallet</ConnectedTitle>
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
