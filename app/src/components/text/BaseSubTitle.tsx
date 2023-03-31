import styled from 'styled-components'

export const BaseSubTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.white};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 2.1rem;
  font-weight: 700;
  margin: 0 0 35px;
`
