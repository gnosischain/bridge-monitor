import styled from 'styled-components'

import { useMemo } from 'react'
import { LimitDot } from '@/src/components/common/LimitDot'
import Image from 'next/image'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  column-gap: ${({ theme: { common } }) => common.space}px;
`

const Title = styled.h3`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1;
  margin: 0;
`

const Circle = styled.div<{ bgColor: string }>`
  --size: 40px;

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

const Dot = styled(LimitDot)`
  margin-left: auto;
`

interface Props {
  shortName: string
  title: string
  validatorHealth: string
}

export const BridgeValidatorHeader: React.FC<Props> = ({
  shortName,
  title,
  validatorHealth,
  ...restProps
}) => {
  const validator = shortName.toUpperCase()
  const validatorIcon = useMemo(() => {
    const basePath = '/images/validators/'
    const data =
      validator === 'S'
        ? { image: `${basePath}safe.svg`, size: 38, bgColor: '#12FF80' }
        : validator === 'GW'
        ? { image: `${basePath}gateway.svg`, size: 36, bgColor: '#EDE9EF' }
        : validator === 'PF'
        ? { image: `${basePath}protofire.svg`, size: 28, bgColor: '#121f3f' }
        : validator === 'CP'
        ? { image: `${basePath}cow-protocol.svg`, size: 40, bgColor: '#052b65' }
        : validator === 'GD'
        ? { image: `${basePath}gnosis-dao.png`, size: 36, bgColor: '#0d251c' }
        : validator === 'K'
        ? { image: `${basePath}karpatkey.svg`, size: 36, bgColor: '#221F20' }
        : validator === 'G'
        ? { image: `${basePath}giveth.svg`, size: 30, bgColor: '#fff' }
        : validator === 'TY'
        ? { image: `${basePath}telepathy.svg`, size: 36, bgColor: '#fff' }
        : { image: `${basePath}empty-token.png`, size: 40, bgColor: '#3E6957' }

    return (
      <Circle bgColor={data.bgColor}>
        <Image alt={title} height={data.size} src={data.image} width={data.size} />
      </Circle>
    )
  }, [title, validator])

  return (
    <Wrapper {...restProps}>
      {validatorIcon}
      <Title>{title}</Title>
      <Dot status={validatorHealth} />
    </Wrapper>
  )
}
