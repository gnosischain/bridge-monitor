import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { StatusTypes } from '@/src/constants/types'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: end;
  gap: ${({ theme: { common } }) => common.space}px;
  margin: ${({ theme: { common } }) => common.space * 4}px 0;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    flex-direction: row;
    align-items: center;
    gap: ${({ theme: { common } }) => common.space * 4}px;
  }
`
const Label = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme: { common } }) => common.space}px;
  font-size: 1.4rem;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.cream};
  opacity: 0.6;
`

export const Legend: React.FC = () => {
  return (
    <Wrapper>
      <Label>
        <ValidatorStatus status={StatusTypes.pending} />
        Pending
      </Label>
      <Label>
        <ValidatorStatus status={StatusTypes.submitted} />
        Signature submitted
      </Label>
      <Label>
        <ValidatorStatus status={StatusTypes.submittedExecuted} />
        Signature submitted + executed
      </Label>
      <Label>
        <ValidatorStatus status={StatusTypes.executed} />
        Executed
      </Label>
      <Label>
        <ValidatorStatus status={StatusTypes.notRequired} />
        Not Required
      </Label>
    </Wrapper>
  )
}
