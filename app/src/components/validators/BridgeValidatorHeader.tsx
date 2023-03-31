import styled from 'styled-components'

import { LimitDot } from '@/src/components/limits/LimitDot'

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

const Circle = styled.div`
  --size: 40px;

  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.primary};
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
  title: string
  validatorHealth: string
}

export const BridgeValidatorHeader: React.FC<Props> = ({
  title,
  validatorHealth,
  ...restProps
}) => {
  const Capitals = title.replace(/[a-z+\s]/g, '')

  return (
    <Wrapper {...restProps}>
      <Circle>{Capitals}</Circle>
      <Title>{title}</Title>
      <Dot status={validatorHealth} />
    </Wrapper>
  )
}
