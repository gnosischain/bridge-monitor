import { Chains, ChainsValues } from '@/src/constants/config/types'
import { TRANSMUTER_ADDRESS, ZERO_BN } from '@/src/constants/misc'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { MaxButton } from './AmountTokenInput'
import { fromBN } from '@/src/utils/bigNumber'
import { formatNumber } from '@/src/utils/format'
import { TokenUsdc } from './types'
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
  flex-wrap: wrap;
  font-size: 1.6rem;
  gap: 4px;
  line-height: 1.2;
  padding-right: 0.2rem;
  padding-left: 0.2rem;
`

const Title = styled.span`
  font-weight: 300;
  line-height: 1.2;
  opacity: 0.7;
`

const Value = styled.span`
  line-height: 1.2;
  font-weight: 400;
  word-break: break-all;
`

const BalanceTitle = () => <Title>Balance:</Title>

const Balance: React.FC<{
  address: string
  chainId: ChainsValues
  token: TokenUsdc
  allowanceAddress?: string
  onMax?: (value: string) => void
}> = genericSuspense(
  ({ address, allowanceAddress, chainId, onMax, token, ...restProps }) => {
    const { data } = useUserTokenBalances({
      userAddress: address,
      allowanceAddress,
      chainId,
      tokenAddress: token.address,
    })

    const balance = data?.balance || ZERO_BN
    const value = formatNumber(Number(fromBN(balance, token?.decimals)))

    return (
      <Wrapper {...restProps}>
        <BalanceWrapper>
          <BalanceTitle />
          <Value>{!value || value === '0' ? '0.00' : value}</Value>
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
  onMax?: (value: string) => void
  token?: TokenUsdc | undefined
}> = ({ address, onMax, token, ...restProps }) => {
  if (!token || !address) {
    return (
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
    )
  }

  return (
    <Balance
      address={address}
      allowanceAddress={TRANSMUTER_ADDRESS}
      chainId={Chains.gnosis}
      onMax={onMax}
      token={token}
      {...restProps}
    />
  )
}
