import React from 'react'
import styled from 'styled-components'
import { Tooltip } from '@/src/components/tooltip'
import formatDistance from 'date-fns/formatDistance'
import { useBridgeFee } from '@/src/hooks/bridge/useBridgeFee'
import { useBridgeRequiredBlocks } from '@/src/hooks/bridge/useBridgeRequiredBlocks'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { formatUnits } from 'ethers/lib/utils'
import { ChainsValues } from '@/src/constants/config/types'
import { BigNumber } from 'ethers'
import { Token } from '@/types/token'
import { ZERO_BN } from '@/src/constants/misc'
import { fromBN } from '@/src/utils/bigNumber'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { Loading } from '@/src/components/loading'
import { genericSuspense } from '@/src/components/safeSuspense'
import { useClaimFee } from '@/src/hooks/bridge/useClaimFee'

const Wrapper = styled.ul`
  background: ${({ theme: { colors } }) => colors.white_50};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  margin: 0;
  min-height: 224px;
  padding: calc(var(--theme-common-space) * 3);
  row-gap: calc(var(--theme-common-space) * 2);
  width: 100%;
`

const Item = styled.li`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.4rem;
  justify-content: space-between;
  line-height: 1.2;
  list-style: none;
  padding: var(--theme-common-space) 0 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.cream};
    padding: var(--theme-common-space) 0;
  }
`

const ItemWarning = styled(Item)`
  color: ${({ theme: { colors } }) => colors.error};
`

const Value = styled.span`
  align-items: center;
  display: flex;
  gap: var(--theme-common-space);
`

export const TxPreviewLoading: React.FC = ({ ...restProps }) => {
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
  amount: BigNumber
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

    const { data: requiredBlocks } = useBridgeRequiredBlocks(fromChainId, isNativeBridge)
    if (!requiredBlocks) throw new Error('Required blocks are not available')

    const { data: feeInfo } = useBridgeFee({
      amount,
      isFromHome,
      isNativeBridge,
      token,
    })

    const { data: transactionData } = useBridgeTransactionInfo({
      userAddress,
      amount,
      fromChainId,
      receiveNativeToken,
      recipient,
      toChainId,
      token,
    })

    const { data: claimFee } = useClaimFee({
      isFromHome,
      isNativeBridge,
    })

    if (!transactionData) throw new Error('Transaction data is not available')

    const tokenOutAmount = formatUnits(amount.sub(feeInfo || ZERO_BN), tokenOut?.decimals)
    const estimatedTime = requiredBlocks.estimatedTimeInSeconds || 0
    const estimatedTotalGas = `${fromBN(
      transactionData.gasLimit.mul(transactionData.gasPrice),
      appChainConfig.tokenDecimals,
    )} ${appChainConfig.token}`
    const estimatedTotalFee = `${fromBN(feeInfo, appChainConfig.tokenDecimals)} ${
      appChainConfig.token
    }`

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
            {formatDistance(0, estimatedTime * 1000, { includeSeconds: true })}
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
