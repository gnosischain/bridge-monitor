import styled from 'styled-components'

import { HealthStatusTypes } from '@/src/constants/types'

const Wrapper = styled.div<{ status?: string }>`
  padding: ${({ theme: { common } }) => common.space / 2}px
    ${({ theme: { common } }) => common.space}px;
  border-radius: 4px;
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.warning};
  background-color: rgba(0, 0, 0, 0.2);
  strong {
    font-size: 1.2rem;
    line-height: 1.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.cream};
    display: flex;
    align-items: center;
    gap: ${({ theme: { common } }) => common.space}px;
    letter-spacing: -0.2px;
    &:before {
      content: '';
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
    }
  }
`

interface Props {
  text?: string
  status?: string
}

export const LimitLabel: React.FC<Props> = ({ status, text }) => {
  return (
    <Wrapper status={status}>
      <strong>{text}</strong>
    </Wrapper>
  )
}
