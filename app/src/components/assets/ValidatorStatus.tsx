import styled, { css } from 'styled-components'

import { IconCheck } from '@/src/components/assets/IconCheck'

const ValidatorStyles = {
  pending: css`
    background-color: ${({ theme }) => theme.colors.cream};
    opacity: 0.1;
    svg {
      display: none;
    }
  `,
  submitted: css`
    color: ${({ theme }) => theme.colors.warning};
  `,
  submittedExecuted: css`
    color: ${({ theme }) => theme.colors.success};
  `,
  executed: css`
    background-color: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.darkestGrey};
  `,
  notRequired: css`
    border: 1px solid ${({ theme }) => theme.colors.cream};
    opacity: 0.2;
    svg {
      display: none;
    }
  `,
  default: css`
    border: 1px solid ${({ theme }) => theme.colors.cream};
    opacity: 0.2;
    svg {
      display: none;
    }
  `,
}

const Wrapper = styled.span<{ status: keyof typeof ValidatorStyles }>`
  ${(props) => {
    return ValidatorStyles[props.status] ?? ValidatorStyles.default
  }}
  height: 16px;
  width: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export type ValidatorStatusType = keyof typeof ValidatorStyles

interface Props {
  status?: ValidatorStatusType
}

export const ValidatorStatus: React.FC<Props> = ({ status = 'pending' }) => {
  const strokeWidthValue = status !== 'executed' ? 2 : 1.2

  return (
    <Wrapper status={status}>
      <IconCheck strokeWidth={strokeWidthValue} />
    </Wrapper>
  )
}
