import Image from 'next/image'
import { useState } from 'react'
import styled from 'styled-components'

import { useTokenIcons } from '@/src/providers/tokenIconsProvider'

const IconWrapper = styled.span`
  display: flex;
  img {
    border-radius: 50%;
  }
`

const Placeholder = styled.div<{ dimensions: string }>`
  align-items: center;
  background-color: #cacaca;
  border-radius: 50%;
  color: #000;
  display: flex;
  font-size: 80%;
  font-weight: 700;
  height: ${({ dimensions }) => dimensions}px;
  justify-content: center;
  line-height: 1;
  text-transform: uppercase;
  width: ${({ dimensions }) => dimensions}px;
`

interface Props {
  dimensions?: number
  symbol: string
  iconSource?: string
}

export const TokenIcon: React.FC<Props> = ({
  dimensions = 18,
  iconSource,
  symbol,
  ...restProps
}) => {
  const { tokensBySymbol } = useTokenIcons()
  const [error, setError] = useState(false)
  const tokenImage = iconSource ?? tokensBySymbol[symbol.toLowerCase()]?.logoURI

  return tokenImage && !error ? (
    <IconWrapper>
      <Image
        alt={symbol}
        className="tokenIcon"
        height={dimensions}
        onError={() => setError(true)}
        src={tokenImage}
        title={symbol}
        width={dimensions}
        {...restProps}
      />
    </IconWrapper>
  ) : (
    <Placeholder dimensions={`${dimensions}`}>{symbol[0]}</Placeholder>
  )
}
