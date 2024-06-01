import React from 'react'
import styled from 'styled-components'
// import { Tooltip } from '@/src/components/tooltip'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { Loading } from '@/src/components/loading'
import { genericSuspense } from '@/src/components/safeSuspense'
import { TokenUsdc } from './types'

const Wrapper = styled.ul`
  background: ${({ theme: { colors } }) => colors.white_50};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  margin: 0;
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
  token: TokenUsdc
  amount: BigNumber
  tokenOut: TokenUsdc
}> = genericSuspense(
  ({ amount, token, tokenOut, ...restProps }) => {
    const tokenOutAmount = formatUnits(amount, token?.decimals)

    return (
      <Wrapper {...restProps}>
        <Item>
          You will receive
          <Value>
            {`${tokenOutAmount} ${tokenOut?.symbol}`}
            {/* <Tooltip content="Estimated output" /> */}
          </Value>
        </Item>
      </Wrapper>
    )
  },
  ({ ...restProps }) => <TxPreviewLoading {...restProps} />,
)
