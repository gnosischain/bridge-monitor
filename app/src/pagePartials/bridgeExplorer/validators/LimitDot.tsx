import styled from 'styled-components'

import { HealthStatusTypes } from '@/src/constants/types'

const Dot = styled.div<{ status?: string }>`
  --size: 8px;

  background-color: ${(props) =>
    props.status === HealthStatusTypes.success
      ? ({ theme }) => theme.colors.success
      : props.status === HealthStatusTypes.warning
      ? ({ theme }) => theme.colors.warning
      : props.status === HealthStatusTypes.error
      ? ({ theme }) => theme.colors.error
      : ({ theme }) => theme.colors.warning};
  border-radius: 50%;
  height: var(--size);
  width: var(--size);
`

interface Props {
  status?: string
}

export const LimitDot: React.FC<Props> = ({ status, ...restProps }) => {
  return <Dot status={status} {...restProps} />
}
