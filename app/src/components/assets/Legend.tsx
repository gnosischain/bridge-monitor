import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { ValidatorStatusTypes } from '@/src/constants/types'

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space}px;
  justify-content: end;
  margin: ${({ theme: { common } }) => common.space * 4}px 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    align-items: center;
    flex-direction: row;
    gap: ${({ theme: { common } }) => common.space * 4}px;
  }
`
const Label = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  font-size: 1.4rem;
  font-weight: 300;
  gap: ${({ theme: { common } }) => common.space}px;
  opacity: 0.6;
`

export const Legend: React.FC = () => {
  return (
    <Wrapper>
      <Label>
        <ValidatorStatus status={ValidatorStatusTypes.submittedExecuted} />
        Signed
      </Label>
      <Label>
        <ValidatorStatus status={ValidatorStatusTypes.executed} />
        Signed and Executed
      </Label>
      <Label>
        <ValidatorStatus status={ValidatorStatusTypes.notRequired} />
        Not Required
      </Label>
    </Wrapper>
  )
}
