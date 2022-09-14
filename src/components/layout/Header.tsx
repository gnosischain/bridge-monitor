import React, { useState } from 'react'
import styled from 'styled-components'

import { useTranslations } from 'next-intl'

import { ButtonDropdown, ButtonPrimary } from '@/src/components/buttons/Button'
import { MobileMenuButton } from '@/src/components/buttons/MobileMenuButton'
import { SwitchThemeButton } from '@/src/components/buttons/SwitchThemeButton'
import { Dropdown, DropdownItem, DropdownPosition } from '@/src/components/common/Dropdown'
import { Logo as BaseLogo } from '@/src/components/common/Logo'
import { InnerContainer as BaseInnerContainer } from '@/src/components/helpers/InnerContainer'
import { MainMenu } from '@/src/components/navigation/MainMenu'
import { MobileMenu } from '@/src/components/navigation/MobileMenu'
import { chainsConfig } from '@/src/constants/config/chains'
import { ThemeType } from '@/src/constants/types'
import WrongNetwork from '@/src/page_partials/index/WrongNetwork'
import { useThemeContext } from '@/src/providers/themeProvider'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { truncateStringInTheMiddle } from '@/src/utils/tools'

const Wrapper = styled.header`
  align-items: center;
  background-color: ${({ theme }) => theme.header.backgroundColor};
  color: ${({ theme }) => theme.header.color};
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${({ theme }) => theme.header.height};
  position: sticky;
  top: 0;
  z-index: 10;
`

const InnerContainer = styled(BaseInnerContainer)`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`

const Start = styled.div`
  align-items: center;
  column-gap: 20px;
  display: flex;
  justify-content: flex-start;
`

const Logo = styled(BaseLogo)`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    display: flex;
  }
`

const End = styled(Start)`
  justify-content: flex-end;
`

const WalletDropdownWrapper = styled(Dropdown)`
  &.isOpen {
    .dropdownItems {
      row-gap: 10px;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding: 15px;
    }
  }
`

const Item = styled.div`
  color: ${({ theme }) => theme.header.color};
  font-size: 1.3rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`

const NetworkDropdown: React.FC<{ currentThemeName?: ThemeType }> = ({
  currentThemeName,
  ...restProps
}) => {
  const { appChainId, isWalletConnected, pushNetwork, setAppChainId } = useWeb3Connection()
  const chainOptions = Object.values(chainsConfig)
  const currentChain = chainsConfig[appChainId]

  return (
    <Dropdown
      disabled={!isWalletConnected}
      dropdownButton={
        <ButtonDropdown currentThemeName={currentThemeName}>
          {currentChain.shortName}
        </ButtonDropdown>
      }
      items={chainOptions.map((item, index) => (
        <DropdownItem
          key={index}
          onClick={() => {
            setAppChainId(item.chainId)
            pushNetwork({ chainId: item.chainIdHex })
          }}
        >
          {item.name}
        </DropdownItem>
      ))}
      {...restProps}
    />
  )
}

const WalletDropdown: React.FC<{ currentThemeName?: ThemeType }> = ({
  currentThemeName,
  ...restProps
}) => {
  const t = useTranslations('wallet')
  const { address, appChainId, balance, disconnectWallet, wallet } = useWeb3Connection()

  return (
    <WalletDropdownWrapper
      dropdownButton={
        <ButtonDropdown currentThemeName={currentThemeName}>
          {address ? truncateStringInTheMiddle(address, 6, 6) : t('address')}
        </ButtonDropdown>
      }
      dropdownPosition={DropdownPosition.right}
      items={[
        <React.Fragment key="0">
          <Item>
            {t('wallet')}: {wallet?.label}
          </Item>
          <Item>
            {t('appChainId')}: {appChainId.toString()}
          </Item>
          {balance && (
            <Item>
              {balance ? (
                <>
                  {t('yourBalance')}: {Object.values(balance)}
                </>
              ) : (
                'No balance available'
              )}
            </Item>
          )}
          <ButtonPrimary onClick={disconnectWallet}>{t('disconnect')}</ButtonPrimary>
        </React.Fragment>,
      ]}
      {...restProps}
    />
  )
}

export const Header: React.FC = (props) => {
  const { connectWallet, isWalletConnected } = useWeb3Connection()
  const t = useTranslations('wallet')
  const { currentThemeName, switchTheme } = useThemeContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <Wrapper {...props}>
        <InnerContainer>
          <MobileMenuButton onClick={toggleMenu} />
          <Start>
            <Logo />
            <MainMenu />
          </Start>
          <End>
            <WrongNetwork />
            <NetworkDropdown currentThemeName={currentThemeName} />
            {isWalletConnected && <WalletDropdown currentThemeName={currentThemeName} />}
            {!isWalletConnected && (
              <ButtonPrimary onClick={connectWallet}>{t('connect')}</ButtonPrimary>
            )}
            <SwitchThemeButton currentThemeName={currentThemeName} onClick={switchTheme} />
          </End>
        </InnerContainer>
      </Wrapper>
      {isMenuOpen && <MobileMenu onClick={toggleMenu} />}
    </>
  )
}
