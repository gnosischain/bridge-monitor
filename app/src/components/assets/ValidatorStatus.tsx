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

  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`

export type ValidatorStatusType = keyof typeof ValidatorStyles

interface Props {
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void | undefined
  status?: ValidatorStatusType
}

export const ValidatorStatus: React.FC<Props> = ({ onClick, status = 'pending' }) => {
  const strokeWidthValue = status !== 'executed' ? 2 : 1.2

  return (
    <Wrapper onClick={onClick} status={status}>
      <IconCheck strokeWidth={strokeWidthValue} />
    </Wrapper>
  )
}
