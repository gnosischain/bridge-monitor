import styled from 'styled-components'

import { useMemo } from 'react'
import { LimitDot } from '@/src/components/limits/LimitDot'
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

const Circle = styled.div<{ shortName?: string }>`
  --size: 40px;

  align-items: center;
  background-color: ${({ shortName, theme: { colors } }) =>
    shortName === 'GS'
      ? '#12FF80'
      : shortName === 'GW'
      ? '#EDE9EF'
      : shortName === 'PF'
      ? '#121f3f'
      : shortName === 'CP'
      ? '#052b65'
      : shortName === 'GD'
      ? '#0d251c'
      : shortName === 'K'
      ? '#221F20'
      : shortName === 'G'
      ? '#fff'
      : colors.primary};
  border-radius: 50%;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-shrink: 0;
  font-size: 1.4rem;
  font-weight: 700;
  height: var(--size);
  justify-content: center;
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
  const capitals = title.replace(/[a-z+\s]/g, '')
  const validatorIcon = useMemo(() => {
    const basePath = '/images/validators/'
    const icons = `${basePath}${
      shortName === 'GS'
        ? 'gnosis-safe.svg'
        : shortName === 'GW'
        ? 'gateway.svg'
        : shortName === 'PF'
        ? 'protofire.svg'
        : shortName === 'CP'
        ? 'cow-protocol.svg'
        : shortName === 'GD'
        ? 'gnosis-dao.png'
        : shortName === 'K'
        ? 'karpatkey.svg'
        : shortName === 'G'
        ? 'giveth.svg'
        : capitals
    }`
    const size =
      shortName === 'GS'
        ? 38
        : shortName === 'GW'
        ? 36
        : shortName === 'PF'
        ? 28
        : shortName === 'CP'
        ? 40
        : shortName === 'GD'
        ? 36
        : shortName === 'K'
        ? 36
        : shortName === 'G'
        ? 30
        : 40

    return (
      <Circle shortName={shortName}>
        <Image alt={title} height={size} src={icons} width={size} />
      </Circle>
    )
  }, [capitals, shortName, title])

  return (
    <Wrapper {...restProps}>
      {validatorIcon}
      <Title>{title}</Title>
      <Dot status={validatorHealth} />
    </Wrapper>
  )
}
