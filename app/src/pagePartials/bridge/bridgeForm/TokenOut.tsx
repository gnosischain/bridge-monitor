import styled from 'styled-components'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Token } from '@/types/token'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { BigNumber } from 'ethers'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgeFee } from '@/src/hooks/bridge/useBridgeFee'
import { formatUnits } from 'ethers/lib/utils'
import { ReceiveNativeTokenSwitcher } from '@/src/pagePartials/bridge/bridgeForm/ReceiveNativeTokenSwitcher'
import { chainsConfig } from '@/src/constants/config/chains'
import { genericSuspense } from '@/src/components/safeSuspense'

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
      animate={false}
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
  amount: BigNumber
  fromChainId: ChainsValues
  setReceiveNativeToken: (receiveNative: boolean) => void
  toChainId: ChainsValues
  token: Token
  tokenOut: Token
}> = genericSuspense(
  ({
    amount,
    fromChainId,
    setReceiveNativeToken: onReceiveNativeChange,
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tokenOutAmount = formatUnits(amount.sub(feeInfo!), tokenOut?.decimals)

    return (
      <>
        {showNativeTokenSwitcher ? (
          <ReceiveNativeTokenSwitcher
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onReceiveNativeChange(event.target.value === 'ETH')
            }
            options={wethOptions}
            optionsId="ethOptions"
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
