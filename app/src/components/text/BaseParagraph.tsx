import styled from 'styled-components'

export const BaseParagraph = styled.div`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.5rem;
  font-weight: normal;
  line-height: 1.6;
  margin: 0 0 calc(var(--theme-common-space) * 2);
  max-width: 100%;

  &:last-child {
    margin-bottom: 0;
  }

  a {
    color: ${({ theme: { colors } }) => colors.primary};
  }

  ul {
    margin-top: 0;
    margin-bottom: 0;
  }
`
