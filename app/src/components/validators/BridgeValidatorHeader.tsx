import styled from 'styled-components'

import { LimitDot } from '@/src/components/limits/LimitDot'

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    font-family: ${({ theme: { fonts } }) => fonts.family};
    margin: 0;
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 1;
  }
`
const Circle = styled.div`
  background-color: ${({ theme: { colors } }) => colors.primary};
  color: ${({ theme: { colors } }) => colors.cream};
  width: 36px;
  height: 36px;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 14px;
  gap: ${({ theme: { common } }) => common.space}px;
  border-radius: 50%;
`
const ValidatorName = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme: { common } }) => common.space}px;
`

interface Props {
  title: string
  validatorHealth: string
}

export const BridgeValidatorHeader: React.FC<Props> = ({ title, validatorHealth }) => {
  const Capitals = title.replace(/[a-z+\s]/g, '')
  return (
    <Header>
      <ValidatorName>
        <Circle>{Capitals}</Circle>
        <h3>{title}</h3>
      </ValidatorName>
      <LimitDot status={validatorHealth} />
    </Header>
  )
}
