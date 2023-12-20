import styled from 'styled-components'

import { LimitDot } from '@/src/pagePartials/bridgeExplorer/validators/LimitDot'
import { ValidatorIcon } from '@/src/pagePartials/bridgeExplorer/common/ValidatorIcon'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  column-gap: var(--theme-common-space);
`

const Title = styled.h3`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1;
  margin: 0;
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
  return (
    <Wrapper {...restProps}>
      <ValidatorIcon shortName={shortName} title={title} />
      <Title>{title}</Title>
      <Dot status={validatorHealth} />
    </Wrapper>
  )
}
