import styled from 'styled-components'

export const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.darkestGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0 calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 2);
`
