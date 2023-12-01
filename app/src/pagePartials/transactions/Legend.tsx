import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { ValidatorStatusTypes } from '@/src/constants/types'

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: end;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: center;
    column-gap: ${({ theme: { common } }) => common.space * 4}px;
    flex-direction: row;
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
