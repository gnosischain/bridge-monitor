import styled from 'styled-components'

export const TransactionInfo = styled.div`
  background: ${({ theme: { colors } }) => colors.white_50};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 3);
  row-gap: calc(var(--theme-common-space) * 2);
  width: 100%;
`
