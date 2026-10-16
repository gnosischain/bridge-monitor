import styled from 'styled-components'

export const Tabs = styled.nav`
  background-color: ${({ theme }) => theme.colors.lilac};
  border-radius: 999px;
  display: inline-flex;
  gap: 2px;
  max-width: 100%;
  overflow-x: auto;
  padding: 4px;
  width: fit-content;
`
