import styled, { css } from 'styled-components'

import { StatusColors } from '@/src/pagePartials/bridgeExplorer/common/StatusColors'
import { TransactionStatus as TxStatusEnum } from '@/types/generated/subgraph'

type WrapperProps = { status: TxStatusEnum }

const Wrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop),
})<WrapperProps>`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.2rem;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  line-height: 1.2rem;
  text-transform: capitalize;

  ${({ status }: WrapperProps) =>
    css`
      color: ${StatusColors[status] ?? StatusColors.DEFAULT};
    `};

  ${({ status }: WrapperProps) =>
    status !== TxStatusEnum.Initiated &&
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
  status: TxStatusEnum
}

export const TransactionStatus: React.FC<Props> = ({ status, ...restProps }) => {
  const text = status.toLowerCase()

  return (
    <Wrapper status={status} {...restProps}>
      {text}
    </Wrapper>
  )
}
