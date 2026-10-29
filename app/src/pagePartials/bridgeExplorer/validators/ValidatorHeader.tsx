import styled from 'styled-components'

import { LimitDot } from '@/src/pagePartials/bridgeExplorer/validators/LimitDot'
import { ValidatorIcon } from '@/src/pagePartials/bridgeExplorer/common/ValidatorIcon'

const Wrapper = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: flex;
  min-width: 0;
`

const Title = styled.h3`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
`

const Dot = styled(LimitDot)`
  flex-shrink: 0;
`

interface Props {
  shortName: string
  title: string
  validatorHealth: string
}

export const ValidatorHeader: React.FC<Props> = ({
  shortName,
  title,
  validatorHealth,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <ValidatorIcon shortName={shortName} size="32px" title={title} />
      <Title>{title}</Title>
      <Dot status={validatorHealth} />
    </Wrapper>
  )
}
