import styled from 'styled-components'

import { HealthStatusTypes } from '@/src/constants/types'

const Dot = styled.div<{ status?: string }>`
  display: block;
  height: 7px;
  width: 7px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.status === HealthStatusTypes.success
      ? ({ theme }) => theme.colors.success
      : props.status === HealthStatusTypes.warning
      ? ({ theme }) => theme.colors.warning
      : props.status === HealthStatusTypes.error
      ? ({ theme }) => theme.colors.error
      : ({ theme }) => theme.colors.warning};
`

interface Props {
  status?: string
}

export const LimitDot: React.FC<Props> = ({ status }) => {
  return <Dot status={status} />
}
