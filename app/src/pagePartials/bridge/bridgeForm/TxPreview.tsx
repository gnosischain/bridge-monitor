import React from 'react'
import styled from 'styled-components'
import { Tooltip } from '@/src/components/tooltip'
import { txTime } from '@/src/utils/txTime'
import { useBridgeFee } from '@/src/hooks/bridge/useBridgeFee'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { formatUnits } from 'viem'
import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { getChainKey, getNetworkConfig } from '@/src/constants/config/chains'
import { Loading } from '@/src/components/loading'
import { genericSuspense } from '@/src/components/safeSuspense'
import { useClaimFee } from '@/src/hooks/bridge/useClaimFee'

const Wrapper = styled.ul.withConfig({
  shouldForwardProp: (prop) =>
    ![
      'amount',
      'token',
      'tokenOut',
      'fromChainId',
      'toChainId',
      'receiveNativeToken',
      'recipient',
      'userAddress',
    ].includes(prop),
})<{
  amount?: string
  token?: string
  tokenOut?: string
  fromChainId?: number
  toChainId?: number
  receiveNativeToken?: boolean
  recipient?: string
  userAddress?: string
}>`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  min-height: 210px;
  padding: calc(var(--theme-common-space) * 0.5) calc(var(--theme-common-space) * 2);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 0.5) calc(var(--theme-common-space) * 2.5);
  }
`

const Item = styled.li`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.4rem;
  justify-content: space-between;
  line-height: 1.3;
  list-style: none;
  padding: calc(var(--theme-common-space) * 1.5) 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
  }

  &:first-child {
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 500;
  }
`

const ItemWarning = styled(Item)`
  color: ${({ theme: { colors } }) => colors.warning};
`

const Value = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  display: flex;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  gap: var(--theme-common-space);
  text-align: right;

  ${ItemWarning} & {
    color: ${({ theme: { colors } }) => colors.warning};
  }
`

const Warning = styled.div`
  color: ${({ theme: { colors } }) => colors.error};
  font-size: 1.4rem;
  line-height: 1.5;
  padding: calc(var(--theme-common-space) * 1.5) 0;
`
const ExternalLink = styled.a`
  color: ${({ theme: { colors } }) => colors.error};
  word-break: break-all;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TxPreviewLoading: React.FC<Record<string, any>> = ({ ...restProps }) => {
  return (
    <Wrapper as="div" {...restProps}>
      <Loading />
    </Wrapper>
  )
}

export const TxPreview: React.FC<{
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  amount: bigint
  receiveNativeToken: boolean
  recipient: string
  tokenOut: Token
}> = genericSuspense(
  ({
    amount,
    fromChainId,
    receiveNativeToken,
    recipient,
    toChainId,
    token,
    tokenOut,
    userAddress,
    ...restProps
  }) => {
    const appChainConfig = getNetworkConfig(fromChainId)
    const { isFromHome, isNativeBridge } = getBridgeCommonInfo({
      fromChainId,
      toChainId,
      tokenAddress: token.address || '',
    })

    const { data: feeInfo } = useBridgeFee({
      amount,
      isFromHome,
      isNativeBridge,
      token,
    })

    const { data: transactionData, isLoading: isLoadingTransactionData } = useBridgeTransactionInfo(
      {
        userAddress,
        amount,
        fromChainId,
        receiveNativeToken,
        recipient,
        toChainId,
        token,
      },
    )

    const { data: claimFee } = useClaimFee({
      isFromHome,
      isNativeBridge,
    })

    if (isLoadingTransactionData || !transactionData) return <TxPreviewLoading {...restProps} />

    if (transactionData.gasLimit === 0n) {
      return (
        <Wrapper {...restProps}>
          <Warning>
            There is problem with the token approval. Try to revoke previous approval if any on{' '}
            <ExternalLink
              href={`https://revoke.cash/address/${userAddress}?chainId=${fromChainId}`}
              rel="noreferrer"
              target="_blank"
            >
              {`https://revoke.cash/address/${userAddress}?chainId=${fromChainId}`}
            </ExternalLink>{' '}
            and try again.
          </Warning>
        </Wrapper>
      )
    }

    const tokenOutAmount = formatUnits(amount - (feeInfo || 0n), tokenOut?.decimals)
    const estimatedTotalGas = `${formatUnits((transactionData.gasLimit as bigint) * (transactionData.gasPrice as bigint), appChainConfig.tokenDecimals)} ${appChainConfig.token}`
    const estimatedTotalFee = `${formatUnits(feeInfo ?? 0n, appChainConfig.tokenDecimals)} ${appChainConfig.token}`

    return (
      <Wrapper {...restProps}>
        <Item>
          You will receive
          <Value>
            {`${tokenOutAmount} ${tokenOut?.symbol}`}
            <Tooltip content="Estimated output" />
          </Value>
        </Item>
        <Item>
          Estimated time
          <Value>
            {txTime(getChainKey(fromChainId))}
            <Tooltip content="Estimated execution time" />
          </Value>
        </Item>
        <Item>
          Estimated total gas
          <Value>
            {estimatedTotalGas}
            <Tooltip content="Estimated gas fee" />
          </Value>
        </Item>
        <Item>
          Estimated total fee
          <Value>
            {estimatedTotalFee}
            <Tooltip content="Estimated bridge fees" />
          </Value>
        </Item>
        {claimFee && (
          <ItemWarning>
            Estimated claim fee on Ethereum
            <Value>
              {`${formatUnits(claimFee, 18)} ETH`}
              <Tooltip content="You'll need to claim your token on Ethereum" />
            </Value>
          </ItemWarning>
        )}
      </Wrapper>
    )
  },
  ({ ...restProps }) => <TxPreviewLoading {...restProps} />,
)
