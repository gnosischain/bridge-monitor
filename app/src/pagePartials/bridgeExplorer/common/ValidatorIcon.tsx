import styled from 'styled-components'

import Image from 'next/image'

const Wrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['bgColor', 'size'].includes(prop),
})<{ bgColor: string; size?: string }>`
  --size: ${({ size }) => (size ? size : '40px')};

  align-items: center;
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 50%;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-shrink: 0;
  font-size: 1.4rem;
  font-weight: 700;
  height: var(--size);
  justify-content: center;
  overflow: hidden;
  width: var(--size);
`

interface Props {
  size?: string
  shortName: string
  title: string
}

export const ValidatorIcon: React.FC<Props> = ({ shortName, size, title, ...restProps }) => {
  const validator = shortName.toUpperCase()
  const basePath = '/images/validators/'
  const data =
    validator === 'S'
      ? { image: `${basePath}safe.svg`, size: 38, bgColor: '#12FF80' }
      : validator === 'H'
      ? { image: `${basePath}hopr.svg`, size: 36, bgColor: '#EDE9EF' }
      : validator === 'KL'
      ? { image: `${basePath}kleros.svg`, size: 36, bgColor: '#EDE9EF' }
      : validator === 'PF'
      ? { image: `${basePath}protofire.svg`, size: 28, bgColor: '#121f3f' }
      : validator === 'CP'
      ? { image: `${basePath}cow-protocol.png`, size: 40, bgColor: '#052b65' }
      : validator === 'GD'
      ? { image: `${basePath}gnosis.svg`, size: 36, bgColor: '#fff' }
      : validator === 'K'
      ? { image: `${basePath}karpatkey.svg`, size: 36, bgColor: '#221F20' }
      : validator === 'G'
      ? { image: `${basePath}giveth.svg`, size: 30, bgColor: '#fff' }
      : validator === 'GW'
      ? { image: `${basePath}gateway.svg`, size: 36, bgColor: '#EDE9EF' }
      : validator === 'TY'
      ? { image: `${basePath}telepathy.svg`, size: 36, bgColor: '#fff' }
      : { image: `${basePath}empty-token.png`, size: 40, bgColor: '#3E6957' }

  return (
    <Wrapper bgColor={data.bgColor} size={size} {...restProps}>
      <Image
        alt={title}
        className="validatorImage"
        height={data.size}
        src={data.image}
        style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
        width={data.size}
      />
    </Wrapper>
  )
}
