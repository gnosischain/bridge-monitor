import { truncateStringInTheMiddle } from '@/src/utils/tools'
import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { ChevronDown } from '@/src/components/assets/ChevronDown'
import { UserWallet } from '@/src/components/assets/UserWallet'
import { Disconnect } from '@/src/components/assets/Disconnect'
import { MyTransactions } from '@/src/components/assets/MyTransactions'
import { Dropdown, DropdownPosition } from '@/src/components/dropdown'
import { ModalSwitchNetwork } from '@/src/components/modal/ModalSwitchNetwork'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ButtonConnect } from '@/src/components/buttons/ButtonConnect'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { ChainsValues } from '@/src/constants/config/types'
import { chainsConfig } from '@/src/constants/config/chains'
import { myTransactionsFullURL } from '@/src/constants/sections'
import { useRouter } from 'next/router'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import useWeb3Name from '@/src/hooks/useWeb3Name'

const Wrapper = styled(Dropdown)`
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    display: flex;
  }

  .dropdownButton {
    padding: 0;
  }

  .dropdownItems {
    --dropdown-items-padding-vertical: calc(var(--theme-common-space) * 4);
    --dropdown-items-padding-horizontal: calc(var(--theme-common-space) * 3);
    --dropdown-items-border-radius: calc(var(--theme-common-space) * 2);

    background: var(
      --Gradient01,
      linear-gradient(
        203deg,
        ${({ theme: { colors } }) => colors.primaryLight} 14.77%,
        ${({ theme: { colors } }) => colors.primary} 85.24%
      )
    );
    border-radius: var(--dropdown-items-border-radius);
    box-shadow: 0 38.519px 25.481px 0 rgba(0, 0, 0, 0.12), 0 100px 80px 0 rgba(0, 0, 0, 0.2);
    flex-direction: column;
    max-height: none;
    width: 400px;
    overflow: hidden;
    padding: 0;
    top: calc(100% + 10px);
  }
`

const Wallet = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
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
  $border?: boolean
  $closeOnClick?: boolean
  $darkBg?: boolean
  $flexDirection?: string
}

const Item = styled.div<ItemProps>`
  align-items: ${({ $flexDirection }) => ($flexDirection === 'column' ? 'flex-start' : 'center')};
  background: ${({ $darkBg, theme: { colors } }) => ($darkBg ? colors.primary : 'transparent')};
  color: ${({ $darkBg, theme: { colors } }) => ($darkBg ? colors.warning : colors.cream)};
  display: flex;
  flex-direction: ${({ $flexDirection }) => $flexDirection};
  justify-content: space-between;
  padding: var(--dropdown-items-padding-vertical) var(--dropdown-items-padding-horizontal);
  position: relative;

  ${({ $border, theme: { colors } }) =>
    $border &&
    css`
      &:after {
        background: ${colors.primary};
        bottom: 0;
        content: '';
        display: block;
        height: 1px;
        left: var(--dropdown-items-padding-horizontal);
        position: absolute;
        right: var(--dropdown-items-padding-horizontal);
      }
    `}

  &:first-child {
    border-top-left-radius: var(--dropdown-items-border-radius);
    border-top-right-radius: var(--dropdown-items-border-radius);
    padding-bottom: var(--theme-common-space);
  }

  &:last-child {
    border-bottom-left-radius: var(--dropdown-items-border-radius);
    border-bottom-right-radius: var(--dropdown-items-border-radius);
  }
`

Item.defaultProps = {
  $border: false,
  $closeOnClick: true,
  $darkBg: false,
  $flexDirection: 'row',
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

// ClickableItem.defaultProps = Item.defaultProps
ClickableItem.defaultProps = Item.defaultProps as typeof ClickableItem.defaultProps

const ItemLabel = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: grid;
  font-size: 1.6rem;
  font-weight: 500;
  grid-template-columns: 24px 1fr;
  line-height: 1.2;
`

const ChainIconWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const ChainIcon = styled.img`
  --size: 24px;

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

const WalletAddress = styled(TokenAddress)`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;

  svg {
    color: ${({ theme: { colors } }) => colors.cream_50};

    &:hover {
      color: ${({ theme: { colors } }) => colors.cream};
    }
  }
`

const NetworkName = styled.span`
  display: flex;
  flex-direction: column;
  position: relative;
`

const UnsupportedNetwork = styled.span<{ $small?: boolean | undefined }>`
  color: ${({ theme: { colors } }) => colors.error};
  font-weight: 700;
  letter-spacing: -0.5px;

  ${({ $small }) =>
    $small &&
    css`
      font-size: 1.2rem;
      position: absolute;
      top: 100%;
    `}
`

const SwitchNetworkButton = styled.span`
  align-items: center;
  background: ${({ theme: { colors } }) => colors.primary};
  border-radius: 40px;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  height: 32px;
  line-height: 1.2;
  padding: 0 calc(var(--theme-common-space) * 1.5);
`

const Button = styled(ButtonConnect)`
  justify-content: space-between;
  min-width: 186px;
  padding-left: var(--theme-common-space);
`

export const UserDropdown: React.FC = ({ ...restProps }) => {
  const {
    address,
    disconnectWallet,
    getExplorerUrl,
    isWalletNetworkSupported,
    walletLabel,
    walletChainId,
  } = useWeb3Connection()
  const currentNetwork = useMemo(() => chainsConfig[walletChainId as ChainsValues], [walletChainId])
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const router = useRouter()

  const { resolvedName: domainName } = useWeb3Name({
    address: address ?? undefined,
  })

  return (
    <>
      <Wrapper
        dropdownButton={
          <Button>
            <Wallet>
              <UserWallet />
              {address ? (
                domainName ? (
                  <>{domainName}</>
                ) : (
                  truncateStringInTheMiddle(address, 6, 4)
                )
              ) : (
                <SkeletonLoading style={{ width: '93px', height: '18px', minHeight: '0' }} />
              )}
            </Wallet>
            {!isWalletNetworkSupported && <Status />}
            <Chevron />
          </Button>
        }
        dropdownPosition={DropdownPosition.right}
        items={[
          <Item $closeOnClick={false} $flexDirection="column" key="userDropdown_item_0">
            <Title>Connected with {walletLabel}</Title>
            {address && (
              <WalletAddress
                address={address}
                characters={6}
                copy
                href={getExplorerUrl(address)}
                useDomain
              />
            )}
          </Item>,
          <ClickableItem
            $border
            key="userDropdown_item_1"
            onClick={() => setShowNetworkModal(true)}
          >
            <ItemLabel>
              <ChainIconWrapper>
                <ChainIcon
                  alt={currentNetwork ? currentNetwork.name : ''}
                  src={
                    currentNetwork?.chainId === 100
                      ? '/images/icons/gnosis.svg'
                      : currentNetwork?.chainId === 1
                      ? '/images/icons/ethToken.svg'
                      : '/images/icons/empty-token.png'
                  }
                />
              </ChainIconWrapper>
              <NetworkName>
                {currentNetwork && <span>{currentNetwork.name}</span>}
                <UnsupportedNetwork $small={currentNetwork !== undefined}>
                  {!isWalletNetworkSupported && 'Unsupported network'}
                </UnsupportedNetwork>
              </NetworkName>
            </ItemLabel>
            <SwitchNetworkButton>Switch Network</SwitchNetworkButton>
          </ClickableItem>,
          <ClickableItem
            key="userDropdown_item_2"
            onClick={() => router.push(`${myTransactionsFullURL}${address}`)}
          >
            <ItemLabel>
              <MyTransactions />
              My transactions
            </ItemLabel>
          </ClickableItem>,
          <ClickableItem $darkBg key="userDropdown_item_3" onClick={disconnectWallet}>
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
