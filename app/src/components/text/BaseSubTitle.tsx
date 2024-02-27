import styled from 'styled-components'

export const BaseSubTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 calc(var(--theme-common-space) * 3);

  a {
    color: ${({ theme: { colors } }) => colors.primary};
  }
`

export const EmphasizedTitle = styled(BaseSubTitle)`
  font-size: 1.9rem;
  margin: 0 0 calc(var(--theme-common-space) * 2);
`
