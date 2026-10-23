import styled from 'styled-components'

export const BaseSubTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin: 0;

  a {
    color: ${({ theme: { colors } }) => colors.violet};
  }

  &:not(:first-of-type) {
    margin-top: calc(var(--theme-common-space) * 6);
  }
`

export const EmphasizedTitle = styled.h3`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.4;
  margin: calc(var(--theme-common-space) * 3) 0 var(--theme-common-space);

  a {
    color: ${({ theme: { colors } }) => colors.violet};
  }
`
