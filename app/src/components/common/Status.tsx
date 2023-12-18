import styled, { css } from 'styled-components'

import { StatusColors } from '@/src/components/helpers/StatusColors'
import { TransactionStatus } from '@/types/generated/subgraph'

const Wrapper = styled.div<{ status: TransactionStatus }>`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
  font-size: 1.2rem;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  line-height: 1.2rem;
  text-transform: capitalize;

  ${({ status }) =>
    css`
      color: ${StatusColors[status] ?? StatusColors.DEFAULT};
    `};

  ${({ status }) =>
    status !== TransactionStatus.Initiated &&
    css`
      &:before {
        --before-size: 7px;

        background-color: ${StatusColors[status] ?? StatusColors.DEFAULT};
        border-radius: 50%;
        content: '';
        display: block;
        height: var(--before-size);
        width: var(--before-size);
      }
    `};

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: flex;
  }
`

export interface Props {
  status: TransactionStatus
}

export const Status: React.FC<Props> = ({ status, ...restProps }) => {
  const text = status.toLowerCase()

  return (
    <Wrapper status={status} {...restProps}>
      {text}
    </Wrapper>
  )
}
