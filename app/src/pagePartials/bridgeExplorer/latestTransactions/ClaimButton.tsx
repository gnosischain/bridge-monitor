import styled from 'styled-components'

import { useClaim } from '@/src/hooks/bridge/useClaim'
import { ClaimActions } from '@/src/hooks/useTransactions'
import { Transaction } from '@/src/utils/transactions'

const Wrapper = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.ink};
  border-radius: 999px;
  border: none;
  color: ${({ theme: { colors } }) => colors.surface};
  column-gap: 6px;
  cursor: pointer;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.3rem;
  font-weight: 600;
  height: 30px;
  justify-content: center;
  line-height: 1;
  min-width: 80px;
  padding: 0 calc(var(--theme-common-space) * 1.75);
  transition: background-color 0.15s linear;
  width: fit-content;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.inkHover};
  }

  &:active {
    opacity: 0.6;
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

type ClaimButtonProps = {
  claimActions: ClaimActions
  transaction: Transaction
}

export const ClaimButton = ({ claimActions, transaction, ...restProps }: ClaimButtonProps) => {
  const { claim, isWorking } = useClaim(transaction, claimActions)

  const handleClaim = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    await claim()
  }

  return (
    <Wrapper disabled={isWorking || transaction.isClaiming} onClick={handleClaim} {...restProps}>
      Claim
      {transaction.isClaiming && 'ing...'}
    </Wrapper>
  )
}
