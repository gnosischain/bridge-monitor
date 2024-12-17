import Image from 'next/image'
import { useState } from 'react'
import styled from 'styled-components'

const IconWrapper = styled.span`
  display: flex;
  flex-shrink: 0;

  img {
    border-radius: 50%;
    flex-shrink: 0;
  }
`

const Placeholder = styled.div.withConfig({
  shouldForwardProp: (prop) => !['dimensions'].includes(prop),
})<{ dimensions: string }>`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamDark};
  flex-shrink: 0;
  border-radius: 50%;
  color: ${({ theme: { colors } }) => colors.primary};
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
  iconSource?: string
  symbol: string
}

export const TokenIcon: React.FC<Props> = ({
  dimensions = 18,
  iconSource,
  symbol,
  ...restProps
}) => {
  const [error, setError] = useState(false)

  return iconSource && !error ? (
    <IconWrapper>
      <Image
        alt={symbol}
        className="tokenIcon"
        height={dimensions}
        onError={() => setError(true)}
        src={iconSource}
        title={symbol}
        width={dimensions}
        {...restProps}
      />
    </IconWrapper>
  ) : (
    <Placeholder dimensions={`${dimensions}`}>{symbol[0]}</Placeholder>
  )
}
