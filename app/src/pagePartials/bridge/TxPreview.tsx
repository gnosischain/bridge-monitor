import React from 'react'
import styled from 'styled-components'

import { Tooltip } from '@/src/components/tooltip'
import { Loading } from '@/src/components/loading'

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

export const TxPreview: React.FC<{
  estimatedTime: string
  estimatedTotalFee: string
  estimatedTotalGas: string
  receivedAmount: string
  isLoading: boolean
}> = ({ estimatedTime, estimatedTotalFee, estimatedTotalGas, isLoading, receivedAmount }) => {
  return (
    <Wrapper>
      {isLoading ? (
        <Loading text="Loading..." />
      ) : (
        <>
          <Item>
            You will receive
            <Value>
              {receivedAmount}
              <Tooltip content="Estimated output" />
            </Value>
          </Item>
          <Item>
            Estimated time
            <Value>
              {estimatedTime}
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
        </>
      )}
    </Wrapper>
  )
}
