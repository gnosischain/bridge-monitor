import styled from 'styled-components'

export const StepButton = styled.button`
  align-items: center;
  align-self: flex-start;
  background-color: ${({ theme: { colors } }) => colors.ink};
  border-radius: 999px;
  border: none;
  color: ${({ theme: { colors } }) => colors.surface};
  column-gap: 6px;
  cursor: pointer;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.3rem;
  font-weight: 600;
  height: 32px;
  justify-content: center;
  line-height: 1;
  min-width: 96px;
  padding: 0 calc(var(--theme-common-space) * 2);
  transition: background-color 0.15s ease-out;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.inkHover};
  }

  &:active {
    opacity: 0.7;
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme: { colors } }) => colors.ink};
    cursor: not-allowed;
    opacity: 0.5;
  }
`
