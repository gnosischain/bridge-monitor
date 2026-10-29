import styled from 'styled-components'

export const List = styled.ul`
  margin: 0 0 calc(var(--theme-common-space) * 2);
  max-width: 100%;
  padding-left: calc(var(--theme-common-space) * 2.5);

  &:last-child {
    margin-bottom: 0;
  }

  a {
    color: ${({ theme: { colors } }) => colors.violet};
    text-underline-offset: 3px;
  }
`

export const ListItem = styled.li`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  font-weight: normal;
  line-height: 1.7;
  margin: 0 0 var(--theme-common-space);

  &:last-child {
    margin-bottom: 0;
  }
`
