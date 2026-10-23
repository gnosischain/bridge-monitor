import styled from 'styled-components'

export const BaseParagraph = styled.div`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  font-weight: normal;
  line-height: 1.7;
  margin: 0 0 calc(var(--theme-common-space) * 2);
  max-width: 100%;
  overflow-wrap: anywhere;

  &:last-child {
    margin-bottom: 0;
  }

  a {
    color: ${({ theme: { colors } }) => colors.violet};
    text-underline-offset: 3px;
  }

  b,
  strong {
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 600;
  }

  ul {
    margin-bottom: 0;
    margin-top: var(--theme-common-space);
    padding-left: calc(var(--theme-common-space) * 2.5);
  }

  li + li {
    margin-top: 4px;
  }
`
