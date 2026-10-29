import styled, { css } from 'styled-components'

import {
  StatusBackgrounds,
  StatusColors,
} from '@/src/pagePartials/bridgeExplorer/common/StatusColors'
import { TransactionStatus as TxStatusEnum } from '@/src/utils/transactions'

type WrapperProps = { status: TxStatusEnum }

// Initiated transfers get no dot: the list shows a warning icon with the expected delay next to them
// (see StatusCell).
const Wrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop),
})<WrapperProps>`
  align-items: center;
  border-radius: 999px;
  column-gap: 6px;
  display: inline-flex;
  font-size: 1.2rem;
  font-weight: 600;
  height: 24px;
  line-height: 1;
  padding: 0 10px;
  text-transform: capitalize;
  white-space: nowrap;
  width: fit-content;

  ${({ status }: WrapperProps) => css`
    background-color: ${StatusBackgrounds[status] ?? StatusBackgrounds.DEFAULT};
    color: ${StatusColors[status] ?? StatusColors.DEFAULT};
  `};

  ${({ status }: WrapperProps) =>
    status !== TxStatusEnum.Initiated &&
    css`
      &:before {
        --before-size: 6px;

        background-color: ${StatusColors[status] ?? StatusColors.DEFAULT};
        border-radius: 50%;
        content: '';
        display: block;
        flex-shrink: 0;
        height: var(--before-size);
        width: var(--before-size);
      }
    `};
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
