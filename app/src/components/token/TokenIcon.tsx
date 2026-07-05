import Image from 'next/image'
import { useState } from 'react'
import styled from 'styled-components'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

const IconWrapper = styled.span`
  display: flex;
  flex-shrink: 0;
  position: relative;

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
  const [prevSource, setPrevSource] = useState(iconSource)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Reset the load/error state whenever the icon source changes so a new token shows the skeleton
  // instead of the previously loaded icon while the new image is downloading.
  if (iconSource !== prevSource) {
    setPrevSource(iconSource)
    setError(false)
    setLoaded(false)
  }

  if (!iconSource || error) {
    return <Placeholder dimensions={`${dimensions}`}>{symbol[0]}</Placeholder>
  }

  return (
    <IconWrapper>
      {!loaded && (
        <SkeletonLoading
          style={{
            borderRadius: '50%',
            height: `${dimensions}px`,
            left: 0,
            minHeight: 0,
            minWidth: 0,
            position: 'absolute',
            top: 0,
            width: `${dimensions}px`,
          }}
        />
      )}
      <Image
        alt={symbol}
        className="tokenIcon"
        height={dimensions}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        src={iconSource}
        style={{ opacity: loaded ? 1 : 0 }}
        title={symbol}
        width={dimensions}
        {...restProps}
      />
    </IconWrapper>
  )
}
