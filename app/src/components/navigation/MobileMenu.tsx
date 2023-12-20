import Image from 'next/image'
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
  background-color: ${({ theme: { colors } }) => colors.black};
  cursor: pointer;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
`

const MenuWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.darkestGrey};
  box-shadow: 59.8671px 3.99114px 121px rgba(0, 0, 0, 0.07),
    30.3077px 2.02051px 52.7484px rgba(0, 0, 0, 0.04725),
    11.9734px 0.798228px 19.6625px rgba(0, 0, 0, 0.035),
    2.61919px 0.174612px 6.99531px rgba(0, 0, 0, 0.02275);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 0 calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 4);
  max-width: 94%;
  position: absolute;
  right: 0;
  top: 0;
  width: 660px;
  z-index: 20;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: 0 calc(var(--theme-common-space) * 4) calc(var(--theme-common-space) * 4);
  }
`

const MenuHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid rgba(256, 256, 256, 0.1);
  display: flex;
  justify-content: space-between;
  margin-bottom: calc(var(--theme-common-space) * 4);
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
  row-gap: var(--theme-common-space);
  width: 100%;
`

const ButtonCSS = css`
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme: { colors } }) => colors.white};
  display: flex;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 2);
  text-decoration: none;

  &.active {
    background-color: ${({ theme: { colors } }) => colors.primary};
  }

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.primary};
    color: ${({ theme: { colors } }) => colors.white};
  }
`

const NavLink = styled(BaseNavLink)`
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  font-size: 1.6rem;
  ${ButtonCSS}
`

const UserMenu = styled.div`
  background: ${({ theme: { gradients } }) => gradients.gray};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: var(--theme-common-space);
`

const Connected = styled.div`
  color: ${({ theme: { colors } }) => colors.white};
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
  color: ${({ theme: { colors } }) => colors.white};
  column-gap: 10px;
  display: flex;
  font-size: 1.4rem;
  line-height: 1.2;
`

const UserButton = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  border: none;
  column-gap: 6px;
  font-size: 1.5rem;
  justify-content: space-between;
  ${ButtonCSS}
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

const LogoutLabel = styled.div`
  color: ${({ theme: { colors } }) => colors.warning};
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
          <MenuHeader>
            <H2>Menu</H2>
            <CloseButton onClick={() => closeMenu()}>
              <Image alt="Alerts" height={24} src="/images/icon-close.svg" width={24} />
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
                <LogoutLabel>Log Out</LogoutLabel>
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
