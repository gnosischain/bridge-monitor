import React from 'react'
import styled from 'styled-components'
import { formatUnits } from 'viem'
import { Loading } from '@/src/components/loading'
import { TokenUsdc } from './types'

const Wrapper = styled.ul`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  padding: calc(var(--theme-common-space) * 0.5) calc(var(--theme-common-space) * 2);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 0.5) calc(var(--theme-common-space) * 2.5);
  }
`

const Item = styled.li`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  justify-content: space-between;
  line-height: 1.3;
  list-style: none;
  padding: calc(var(--theme-common-space) * 1.5) 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
  }
`

const Value = styled.span`
  align-items: center;
  display: flex;
  font-variant-numeric: tabular-nums;
  gap: var(--theme-common-space);
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
  token: TokenUsdc
  amount: bigint
  tokenOut: TokenUsdc
}> = ({ amount, token, tokenOut, ...restProps }) => {
  const tokenOutAmount = formatUnits(amount, token.decimals)

  return (
    <Wrapper {...restProps}>
      <Item>
        You will receive
        <Value>{`${tokenOutAmount} ${tokenOut?.symbol}`}</Value>
      </Item>
    </Wrapper>
  )
}
