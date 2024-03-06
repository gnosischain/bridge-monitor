import { ChainsValues } from '@/src/constants/config/types'
import { ZERO_BN } from '@/src/constants/misc'
import { useBridgeContracts } from '@/src/hooks/bridge/useBridgeContracts'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { MaxButton } from '@/src/pagePartials/bridge/bridgeForm/AmountTokenInput'
import { fromBN } from '@/src/utils/bigNumber'
import { formatNumber } from '@/src/utils/format'
import { Token } from '@/types/token'
import { formatUnits } from 'ethers/lib/utils'
import styled from 'styled-components'
import { genericSuspense } from '@/src/components/safeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  margin-left: auto;
`

const BalanceWrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 1.6rem;
  gap: 4px;
  line-height: 1.2;
`

const Title = styled.span`
  font-weight: 300;
  line-height: 1.2;
  opacity: 0.7;
`

const Value = styled.span`
  line-height: 1.2;
  font-weight: 400;
`

const BalanceTitle = () => <Title>Balance:</Title>

const Balance: React.FC<{
  address: string
  fromChainId: ChainsValues
  onMax?: (value: string) => void
  toChainId: ChainsValues
  token: Token
}> = genericSuspense(
  ({ address, fromChainId, onMax, toChainId, token, ...restProps }) => {
    const { getFromBridgeWithSigner } = useBridgeContracts()
    const fromBridgeAddress = getFromBridgeWithSigner(fromChainId, toChainId, token.address).address

    const { data } = useUserTokenBalances({
      userAddress: address,
      allowanceAddress: fromBridgeAddress,
      chainId: fromChainId,
      tokenAddress: token.address,
    })

    const balance = data?.balance || ZERO_BN
    const value = formatNumber(Number(fromBN(balance, token?.decimals)))

    return (
      <Wrapper {...restProps}>
        <BalanceWrapper>
          <BalanceTitle />
          <Value>
            {!value || value === '0' ? '0.00' : value} {token?.symbol}
          </Value>
        </BalanceWrapper>
        {onMax && (
          <MaxButton
            disabled={balance?.isZero()}
            onClick={() => onMax(formatUnits(balance, token.decimals))}
          />
        )}
      </Wrapper>
    )
  },
  ({ onMax, ...restProps }) => (
    <Wrapper {...restProps}>
      <BalanceWrapper>
        <BalanceTitle />
        <SkeletonLoading style={{ minWidth: 0, minHeight: 0, height: '16px', width: '75px' }} />
      </BalanceWrapper>
      {onMax && (
        <MaxButton
          disabled
          onClick={() => {
            return false
          }}
        />
      )}
    </Wrapper>
  ),
)

export const UserBalance: React.FC<{
  address?: string | null
  fromChainId: ChainsValues
  onMax?: (value: string) => void
  toChainId: ChainsValues
  token?: Token | undefined
}> = ({ address, fromChainId, onMax, toChainId, token, ...restProps }) => {
  // If the user clicks the Switch network many times
  // we need to check  if token.chainId !== fromChainId
  // As it might be the case the token and fromChainId are not in sync
  return !token || !address || token.chainId !== fromChainId ? (
    <Wrapper {...restProps}>
      <BalanceWrapper>
        <BalanceTitle />
        <Value>0.00</Value>
      </BalanceWrapper>
      {onMax && (
        <MaxButton
          disabled
          onClick={() => {
            return false
          }}
        />
      )}
    </Wrapper>
  ) : (
    <Balance
      address={address}
      fromChainId={fromChainId}
      onMax={onMax}
      toChainId={toChainId}
      token={token}
      {...restProps}
    />
  )
}
