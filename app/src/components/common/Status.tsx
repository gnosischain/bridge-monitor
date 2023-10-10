import styled, { css } from 'styled-components'
import { MouseEventHandler } from 'react'
import { StatusColors } from '@/src/components/helpers/StatusColors'
import { TransactionStatus } from '@/types/generated/subgraph'

const Text = styled.span`
  align-items: center;
  column-gap: 6px;
  display: flex;
  font-size: 1.2rem;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  line-height: 1.2rem;
  padding: 0 ${({ theme: { common } }) => common.space}px;
  text-transform: capitalize;
`

const Wrapper = styled.div<{ status: TransactionStatus }>`
  border-radius: 4px;
  border: none;
  display: block;
  min-width: 80px;
  padding: 0;

  ${({ status }) =>
    status === TransactionStatus.Unclaimed
      ? css`
          background-color: ${StatusColors[status] ?? StatusColors.DEFAULT};
          cursor: pointer;
          transition: none;

          &:active {
            opacity: 0.6;
          }

          ${Text} {
            color: ${({ theme }) => theme.colors.darkestGrey};
          }

          &[disabled],
          &[disabled]:hover {
            cursor: not-allowed;
            opacity: 0.5;
          }
        `
      : css`
          ${Text} {
            color: ${StatusColors[status] ?? StatusColors.DEFAULT};

            &:before {
              --before-size: 7px;

              background-color: ${StatusColors[status] ?? StatusColors.DEFAULT};
              border-radius: 50%;
              content: '';
              display: block;
              height: var(--before-size);
              width: var(--before-size);
            }
          }
        `};
`

interface Props {
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
  status: TransactionStatus
}

export const Status: React.FC<Props> = ({ onClick, status, ...restProps }) => {
  const text = status === TransactionStatus.Unclaimed ? 'Claim' : status.toLowerCase()
  return (
    <Wrapper
      as={status === TransactionStatus.Unclaimed ? 'button' : 'div'}
      onClick={onClick}
      status={status}
      {...restProps}
    >
      <Text>{text}</Text>
    </Wrapper>
  )
}
