import styled from 'styled-components'

export const Tabs = styled.nav`
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkerGrey};
  display: flex;
  padding-right: ${({ theme: { common } }) => common.space * 2}px;
`
