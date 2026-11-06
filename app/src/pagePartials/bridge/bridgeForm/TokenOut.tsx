import styled from 'styled-components'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Token } from '@/types/token'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgeFee } from '@/src/hooks/bridge/useBridgeFee'
import { formatUnits } from 'viem'
import { ReceiveTokenSwitcher } from '@/src/pagePartials/bridge/bridgeForm/ReceiveTokenSwitcher'
import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'
import React, { useState } from 'react'

const NoTokenSelected = styled.span`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
`

// Same size as the amount typed on the other side, so the two panels read alike.
const TokenOutValue = styled.span<{ disabled?: boolean }>`
  color: ${({ disabled, theme: { colors } }) => (disabled ? colors.faint : colors.ink)};
  flex-grow: 1;
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 44px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 3.2rem;
  }
`

const TokenLabel = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: var(--theme-common-space);
  display: flex;
  flex-shrink: 0;
  font-size: 1.6rem;
  font-weight: 600;
`

const wethOptions = [
  {
    icon: '/images/icons/wethToken.svg',
    label: 'WETH',
    name: 'eth-types',
  },
  {
    icon: '/images/icons/ethToken.svg',
    label: 'ETH',
    name: 'eth-types',
  },
]

const xdaiOptions = [
  {
    icon: '/images/icons/dai.svg',
    label: 'DAI',
    name: 'xdai-types',
  },
  {
    icon: '/images/icons/usds.webp',
    label: 'USDS',
    name: 'xdai-types',
  },
]

export const NoTokenOut: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <>
    <TokenOutValue disabled>0.00</TokenOutValue>
    <TokenLabel>
      <SkeletonLoading
        $animate={!!loading}
        style={{
          borderRadius: '50%',
          height: '24px',
          width: '24px',
          minWidth: '0',
        }}
      />
      {loading ? (
        <SkeletonLoading style={{ height: '20px', minWidth: '0', width: '80px' }} />
      ) : (
        <NoTokenSelected>No token selected</NoTokenSelected>
      )}
    </TokenLabel>
  </>
)

export const TokenOut: React.FC<{
  amount: bigint
  fromChainId: ChainsValues
  setReceiveNativeToken: (receiveNative: boolean) => void
  setReceiveUsds: (receiveUsds: boolean) => void
  toChainId: ChainsValues
  token: Token
  tokenOut: Token
}> = ({
  amount,
  fromChainId,
  setReceiveNativeToken: onReceiveNativeChange,
  setReceiveUsds: onReceiveUsdsChange,
  toChainId,
  token,
  tokenOut,
}) => {
  const { isFromHome, isNativeBridge } = getBridgeCommonInfo({
    fromChainId: fromChainId,
    toChainId: toChainId,
    tokenAddress: token.address,
  })

  const { data: feeInfo } = useBridgeFee({
    amount,
    isFromHome,
    isNativeBridge,
    token,
  })

  const showNativeTokenSwitcher =
    fromChainId == Chains.gnosis &&
    token.address == chainsConfig[Chains.gnosis].bridge.wForeignNative

  const showXDaiSwitcher =
    fromChainId === Chains.gnosis && isSameString(token.address, NATIVE_TOKEN_ADDRESS)

  // Add state for selected option
  const [selectedNativeToken, setSelectedNativeToken] = useState(wethOptions[0].label)
  const [selectedXDaiToken, setSelectedXDaiToken] = useState(xdaiOptions[0].label)

  const tokenOutAmount = formatUnits(amount - (feeInfo ?? 0n), tokenOut?.decimals ?? 18)

  const handleSwitchDaiUsds = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedXDaiToken(event.target.value)
    onReceiveUsdsChange(event.target.value === 'USDS')
  }

  return (
    <>
      <TokenOutValue>{tokenOutAmount}</TokenOutValue>
      {showNativeTokenSwitcher ? (
        <ReceiveTokenSwitcher
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedNativeToken(event.target.value)
            onReceiveNativeChange(event.target.value === 'ETH')
          }}
          options={wethOptions}
          optionsId="ethOptions"
          value={selectedNativeToken}
        />
      ) : showXDaiSwitcher ? (
        <ReceiveTokenSwitcher
          onChange={handleSwitchDaiUsds}
          options={xdaiOptions}
          optionsId="xdaiOptions"
          value={selectedXDaiToken}
        />
      ) : (
        <TokenLabel>
          <TokenIcon dimensions={24} iconSource={tokenOut.logoURI} symbol={tokenOut.symbol} />
          {tokenOut.symbol}
        </TokenLabel>
      )}
    </>
  )
}
