import styled from 'styled-components'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Token } from '@/types/token'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgeFee } from '@/src/hooks/bridge/useBridgeFee'
import { ReceiveTokenSwitcher } from '@/src/pagePartials/bridge/bridgeForm/ReceiveTokenSwitcher'
import { chainsConfig } from '@/src/constants/config/chains'
import { genericSuspense } from '@/src/components/safeSuspense'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'
import React, { useState } from 'react'
import { useIsUsdsEnabled } from '@/src/hooks/contracts/useIsUsdsEnabled'
import { formatUnits } from 'viem'

const NoTokenSelected = styled.span`
  font-size: 1.5rem;
  opacity: 0.8;
`

const TokenOutValue = styled.span<{ disabled?: boolean }>`
  font-size: 1.5rem;
  font-weight: 500;
  margin-left: auto;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
    font-weight: 600;
  }
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

export const NoTokenOut: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <>
    <SkeletonLoading
      $animate={false}
      style={{
        borderRadius: '50%',
        height: '24px',
        width: '24px',
        minWidth: '0',
      }}
    />
    <NoTokenSelected>{loading ? 'Loading...' : 'No token selected'}</NoTokenSelected>
    <TokenOutValue disabled>0.00</TokenOutValue>
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
}> = genericSuspense(
  ({
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

    const feeInfo = useBridgeFee({
      amount,
      isFromHome,
      isNativeBridge,
      token,
    })

    const isUsdsEnabled = useIsUsdsEnabled()
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
        disabled: !isUsdsEnabled,
      },
    ]

    const showNativeTokenSwitcher =
      fromChainId == Chains.gnosis &&
      token.address == chainsConfig[Chains.gnosis].bridge.wForeignNative

    const showXDaiSwitcher =
      fromChainId === Chains.gnosis && isSameString(token.address, NATIVE_TOKEN_ADDRESS)

    // Add state for selected option
    const [selectedNativeToken, setSelectedNativeToken] = useState(wethOptions[0].label)
    const [selectedXDaiToken, setSelectedXDaiToken] = useState(xdaiOptions[0].label)

    const tokenOutAmount = formatUnits(amount - feeInfo!, tokenOut?.decimals)

    const handleSwitchDaiUsds = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedXDaiToken(event.target.value)
      onReceiveUsdsChange(event.target.value === 'USDS')
    }

    return (
      <>
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
          <>
            <TokenIcon dimensions={24} iconSource={tokenOut.logoURI} symbol={tokenOut.symbol} />
            {tokenOut.symbol}
          </>
        )}
        <TokenOutValue>{tokenOutAmount}</TokenOutValue>
      </>
    )
  },
  () => <NoTokenOut loading />,
)
