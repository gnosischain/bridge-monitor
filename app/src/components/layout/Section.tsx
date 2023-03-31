import styled from 'styled-components'

export const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.darkestGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  padding: 0 ${({ theme: { common } }) => common.space * 2}px
    ${({ theme: { common } }) => common.space * 2}px;
`
