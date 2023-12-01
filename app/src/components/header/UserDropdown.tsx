import { truncateStringInTheMiddle } from '@/src/utils/tools'
import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { ChevronDown } from '@/src/components/assets/ChevronDown'
import { UserWallet } from '@/src/components/assets/UserWallet'
import { Disconnect } from '@/src/components/assets/Disconnect'
import { MyTransactions } from '@/src/components/assets/MyTransactions'
import { Dropdown, DropdownPosition } from '@/src/components/common/Dropdown'
import { ModalSwitchNetwork } from '@/src/components/helpers/ModalSwitchNetwork'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ButtonConnect } from '@/src/components/buttons/ButtonConnect'
import { Address } from '@/src/components/token/Address'
import { ChainsValues } from '@/src/constants/config/types'
import { chainsConfig } from '@/src/constants/config/chains'
import { useRouter } from 'next/router'

const Wrapper = styled(Dropdown)`
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    display: flex;
  }

  .dropdownButton {
    padding: 0;
  }

  .dropdownItems {
    --dropdown-items-padding: ${({ theme: { common } }) => common.space * 4}px;
    --dropdown-items-border-radius: ${({ theme: { common } }) => common.space * 4}px;

    background: ${({ theme: { colors } }) => colors.darkerGrey};
    border-radius: var(--dropdown-items-border-radius);
    box-shadow: 0 38.51852px 25.48148px 0 rgba(0, 0, 0, 0.12), 0 100px 80px 0 rgba(0, 0, 0, 0.2);
    flex-direction: column;
    max-height: none;
    width: 385px;
    overflow: hidden;
    padding: 0;
    top: calc(100% + 10px);
  }
`

const Wallet = styled.div`
  align-items: center;
  column-gap: 8px;
  display: flex;
`

const Chevron = styled(ChevronDown)`
  transition: transform 0.1s linear;

  .isOpen & {
    transform: rotate(180deg);
  }
`

const Status = styled.div`
  --ball-dimensions: 14px;

  background-color: ${({ theme: { colors } }) => colors.error};
  border-radius: 50%;
  height: var(--ball-dimensions);
  width: var(--ball-dimensions);
  top: 0;
  left: -1px;
  position: absolute;
  z-index: 5;
`

interface ItemProps {
  border?: boolean
  closeOnClick?: boolean
  flexDirection?: string
  lightBg?: boolean
}

const Item = styled.div<ItemProps>`
  align-items: ${({ flexDirection }) => (flexDirection === 'column' ? 'flex-start' : 'center')};
  background: ${({ lightBg, theme: { colors } }) => (lightBg ? colors.darkGrey : 'transparent')};
  color: ${({ lightBg, theme: { colors } }) => (lightBg ? colors.cream : colors.warning)};
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
  justify-content: space-between;
  padding: var(--dropdown-items-padding) var(--dropdown-items-padding);
  position: relative;

  ${({ border }) =>
    border &&
    css`
      &:after {
        background: #35413c;
        bottom: 0;
        content: '';
        display: block;
        height: 1px;
        left: var(--dropdown-items-padding);
        position: absolute;
        right: var(--dropdown-items-padding);
      }
    `}

  &:first-child {
    border-top-left-radius: var(--dropdown-items-border-radius);
    border-top-right-radius: var(--dropdown-items-border-radius);
    padding-bottom: calc(var(--dropdown-items-border-radius) / 2);
  }

  &:last-child {
    border-bottom-left-radius: var(--dropdown-items-border-radius);
    border-bottom-right-radius: var(--dropdown-items-border-radius);
  }
`

Item.defaultProps = {
  border: false,
  flexDirection: 'row',
  lightBg: true,
  closeOnClick: true,
}

const ClickableItem = styled(Item)`
  cursor: pointer;
  transition: background-color 0.15s linear;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &:active {
    opacity: 0.7;
  }
`

ClickableItem.defaultProps = {
  border: false,
  closeOnClick: true,
  flexDirection: 'row',
  lightBg: true,
}

const ItemLabel = styled.div`
  align-items: center;
  column-gap: 16px;
  display: grid;
  font-size: 1.4rem;
  font-weight: 400;
  grid-template-columns: 24px 1fr;
  line-height: 1.2;
`

const ChainIconWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const ChainIcon = styled.img`
  --size: 16px;

  border-radius: 50%;
  display: block;
  height: var(--size);
  width: var(--size);
`

const Title = styled.div`
  color: #fff;
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 6px;
`

const WalletAddress = styled(Address)`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;

  .copyButton,
  .externalLink {
    opacity: 0.4;
    transition: opacity 0.15s linear;

    &:hover {
      opacity: 1;
    }
  }
`

const NetworkName = styled.span`
  display: flex;
  flex-direction: column;
  position: relative;
`

const UnsupportedNetwork = styled.span<{ small?: boolean | undefined }>`
  color: ${({ theme: { colors } }) => colors.error};

  ${({ small }) =>
    small &&
    css`
      font-size: 1.2rem;
      position: absolute;
      top: 100%;
    `}
`

const SwitchNetworkButton = styled.span`
  align-items: center;
  background: ${({ theme: { colors } }) => colors.darkerGrey};
  border-radius: 40px;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  height: 32px;
  line-height: 1.2;
  padding: 0 16px;
`

export const UserDropdown: React.FC = ({ ...restProps }) => {
  const {
    address,
    disconnectWallet,
    getExplorerUrl,
    isWalletNetworkSupported,
    wallet,
    walletChainId,
  } = useWeb3Connection()
  const currentNetwork = useMemo(() => chainsConfig[walletChainId as ChainsValues], [walletChainId])
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const router = useRouter()

  return (
    <>
      <Wrapper
        dropdownButton={
          <ButtonConnect>
            <Wallet>
              <UserWallet /> {address && truncateStringInTheMiddle(address, 6, 4)}
            </Wallet>
            {!isWalletNetworkSupported && <Status />}
            <Chevron />
          </ButtonConnect>
        }
        dropdownPosition={DropdownPosition.right}
        items={[
          <Item closeOnClick={false} flexDirection="column" key="userDropdown_item_0">
            <Title>Connected with {wallet?.label}</Title>
            {address && (
              <WalletAddress address={address} characters={4} copy link={getExplorerUrl(address)} />
            )}
          </Item>,
          <ClickableItem border key="userDropdown_item_1" onClick={() => setShowNetworkModal(true)}>
            <ItemLabel>
              <ChainIconWrapper>
                <ChainIcon
                  alt={currentNetwork ? currentNetwork.name : ''}
                  src={
                    currentNetwork?.chainId === 100
                      ? '/images/icons/gnosis.png'
                      : currentNetwork?.chainId === 1
                      ? '/images/icons/eth.png'
                      : '/images/icons/empty-token.png'
                  }
                />
              </ChainIconWrapper>
              <NetworkName>
                {currentNetwork && <span>{currentNetwork.name}</span>}
                <UnsupportedNetwork small={currentNetwork !== undefined}>
                  {!isWalletNetworkSupported && 'Unsupported network'}
                </UnsupportedNetwork>
              </NetworkName>
            </ItemLabel>
            <SwitchNetworkButton>Switch Network</SwitchNetworkButton>
          </ClickableItem>,
          <ClickableItem
            key="userDropdown_item_2"
            onClick={() => router.push(`my-transactions/?hash=${address}`)}
          >
            <ItemLabel>
              <MyTransactions />
              My transactions
            </ItemLabel>
          </ClickableItem>,
          <ClickableItem key="userDropdown_item_3" lightBg={false} onClick={disconnectWallet}>
            <ItemLabel>
              <Disconnect /> Disconnect
            </ItemLabel>
          </ClickableItem>,
        ]}
        {...restProps}
      />
      {showNetworkModal && <ModalSwitchNetwork onClose={() => setShowNetworkModal(false)} />}
    </>
  )
}
