import styled, { css } from 'styled-components'

import { IconCheck } from '@/src/components/assets/IconCheck'

const NotRequired = css`
  border: 1px solid ${({ theme: { colors } }) => colors.primnary_50};
  opacity: 0.2;

  svg {
    display: none;
  }
`

const ValidatorStyles = {
  // signed
  submittedExecuted: css`
    color: ${({ theme: { colors } }) => colors.success};
  `,
  // signed and executed
  executed: css`
    background-color: ${({ theme: { colors } }) => colors.success};
    color: ${({ theme: { colors } }) => colors.cream};
  `,
  // not required and default are visually the same
  notRequired: NotRequired,
  default: NotRequired,
  // deprecated
  pending: css`
    background-color: ${({ theme: { colors } }) => colors.primary};
    opacity: 0.1;

    svg {
      display: none;
    }
  `,
  // deprecated
  submitted: css`
    color: ${({ theme: { colors } }) => colors.warning};
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
