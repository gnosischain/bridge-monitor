import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { ValidatorStatusTypes } from '@/src/constants/types'

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: end;
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: center;
    column-gap: calc(var(--theme-common-space) * 3);
    flex-direction: row;
  }
`
const Label = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary_50};
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  gap: var(--theme-common-space);
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
