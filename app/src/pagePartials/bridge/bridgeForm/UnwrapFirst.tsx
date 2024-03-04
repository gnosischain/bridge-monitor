import styled from 'styled-components'

import { Warning } from '@/src/components/assets/Warning'
import React from 'react'
import { ButtonFull } from '@/src/components/buttons/Button'

const Contents = styled.div`
  display: flex;
  gap: calc(var(--theme-common-space) * 2);
  min-height: 80px;

  .warning {
    color: ${({ theme: { colors } }) => colors.warning};
  }
`

const Text = styled.span`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.6rem;
  line-height: 1.4;
`

const Button = styled(ButtonFull)`
  cursor: pointer;
`

export const UnwrapFirst: React.FC = () => {
  return (
    <>
      <Contents>
        <Warning />
        <Text>
          <b>wxDAI</b> and <b>sDAI</b> need to be unwrapped to xDAI first before bridging to
          Ethereum. You can swap your tokens using the button below.
        </Text>
      </Contents>
    </>
  )
}

export const ButtonUnwrapFirst: React.FC<{ symbol: string | undefined }> = ({
  symbol,
  ...restProps
}) => {
  return (
    <Button
      as="a"
      href={`https://swap.cow.fi/#/100/swap/${symbol}/xDAI`}
      rel="noreferrer"
      target="_blank"
      {...restProps}
    >
      Swap {symbol}
    </Button>
  )
}
