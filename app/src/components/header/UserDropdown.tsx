import { shortenAddress } from '@/src/utils/tools'
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
import { Eyebrow } from '@/src/components/text/Eyebrow'
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
    --dropdown-items-padding-vertical: calc(var(--theme-common-space) * 1.5);
    --dropdown-items-padding-horizontal: calc(var(--theme-common-space) * 2);

    border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
    max-height: none;
    overflow: hidden;
    padding: var(--theme-common-space);
    top: calc(100% + 10px);
    width: 340px;
  }
`

const Wallet = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
`

const Chevron = styled(ChevronDown)`
  color: ${({ theme: { colors } }) => colors.fog};
  transition: transform 0.1s linear;

  .isOpen & {
    transform: rotate(180deg);
  }
`

const Status = styled.div`
  --ball-dimensions: 10px;

  background-color: ${({ theme: { colors } }) => colors.error};
  border: 2px solid ${({ theme: { colors } }) => colors.surface};
  border-radius: 50%;
  box-sizing: content-box;
  height: var(--ball-dimensions);
  width: var(--ball-dimensions);
  top: -2px;
  left: -2px;
  position: absolute;
  z-index: 5;
`

interface ItemProps {
  $border?: boolean
  $closeOnClick?: boolean
  $danger?: boolean
  $flexDirection?: string
}

const Item = styled.div<ItemProps>`
  align-items: ${({ $flexDirection }) => ($flexDirection === 'column' ? 'flex-start' : 'center')};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ $danger, theme: { colors } }) => ($danger ? colors.error : colors.ink)};
  display: flex;
  flex-direction: ${({ $flexDirection }) => $flexDirection};
  justify-content: space-between;
  padding: var(--dropdown-items-padding-vertical) var(--dropdown-items-padding-horizontal);
  position: relative;

  ${({ $border, theme: { colors } }) =>
    $border &&
    css`
      margin-bottom: var(--theme-common-space);

      &:after {
        background: ${colors.line};
        bottom: calc(var(--theme-common-space) * -0.5);
        content: '';
        display: block;
        height: 1px;
        left: var(--dropdown-items-padding-horizontal);
        position: absolute;
        right: var(--dropdown-items-padding-horizontal);
      }
    `}
`

Item.defaultProps = {
  $border: false,
  $closeOnClick: true,
  $danger: false,
  $flexDirection: 'row',
}

const ClickableItem = styled(Item)`
  cursor: pointer;
  transition: background-color 0.15s linear;

  &:hover {
    background: ${({ theme: { colors } }) => colors.page};
  }

  &:active {
    opacity: 0.7;
  }
`

ClickableItem.defaultProps = Item.defaultProps as typeof ClickableItem.defaultProps

const ItemLabel = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: grid;
  font-size: 1.5rem;
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

const Title = styled(Eyebrow)`
  margin: 0 0 6px;
`

const WalletAddress = styled(TokenAddress)`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;

  svg {
    color: ${({ theme: { colors } }) => colors.fog};

    &:hover {
      color: ${({ theme: { colors } }) => colors.ink};
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
  font-weight: 600;

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
  background: ${({ theme: { colors } }) => colors.lilac};
  border-radius: 999px;
  color: ${({ theme: { colors } }) => colors.violet};
  display: flex;
  font-size: 1.3rem;
  font-weight: 600;
  height: 28px;
  line-height: 1.2;
  padding: 0 calc(var(--theme-common-space) * 1.5);
`

// The connected wallet is a neutral pill, so it doesn't compete with the page's own actions.
const Button = styled(ButtonConnect)`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border-color: ${({ theme: { colors } }) => colors.line};
  color: ${({ theme: { colors } }) => colors.ink};
  font-weight: 500;
  justify-content: space-between;
  min-width: 186px;
  padding-left: 6px;
  padding-right: calc(var(--theme-common-space) * 1.5);

  &:hover,
  &:focus,
  .isOpen & {
    background-color: ${({ theme: { colors } }) => colors.surface};
    border-color: ${({ theme: { colors } }) => colors.faint};
    color: ${({ theme: { colors } }) => colors.ink};
  }
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
                  shortenAddress(address, 6, 4)
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
          <ClickableItem $danger key="userDropdown_item_3" onClick={disconnectWallet}>
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
