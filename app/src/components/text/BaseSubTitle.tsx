import styled from 'styled-components'

export const BaseSubTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin: calc(var(--theme-common-space) * 3) 0 0;

  a {
    color: ${({ theme: { colors } }) => colors.primary};
  }

  &:not(:first-of-type) {
    margin-top: calc(var(--theme-common-space) * 5);
  }
`

export const EmphasizedTitle = styled.h3`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.2;
  margin: calc(var(--theme-common-space) * 2) 0 calc(var(--theme-common-space) * 1);

  a {
    color: ${({ theme: { colors } }) => colors.primary};
  }
`
