import styled from 'styled-components'

import { StatusColors } from '@/src/components/helpers/StatusColors'
import { TransactionStatus } from '@/types/generated/subgraph'

const Wrapper = styled.div<{ status: TransactionStatus }>`
  ${(props) => {
    return StatusColors[props.status] ?? StatusColors.DEFAULT
  }}

  align-items: center;
  border-radius: 4px;
  display: flex;
  gap: ${({ theme: { common } }) => common.space / 2}px;
  letter-spacing: -0.2px;
  padding: ${({ theme: { common } }) => common.space / 4}px
    ${({ theme: { common } }) => common.space / 2}px;
  text-transform: lowercase;

  &:before {
    background-color: ${({ theme }) => theme.colors.darkestGrey};
    border-radius: 50%;
    content: '';
    display: block;
    height: 7px;
    width: 7px;
  }

  strong {
    color: ${({ theme }) => theme.colors.darkestGrey};
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.8rem;

    &:first-letter {
      text-transform: capitalize;
    }
  }
`

interface Props {
  status: TransactionStatus
}

export const Status: React.FC<Props> = ({ status }) => {
  return (
    <Wrapper status={status}>
      <strong>{status}</strong>
    </Wrapper>
  )
}
