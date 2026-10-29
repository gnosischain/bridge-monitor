import styled from 'styled-components'
import { ButtonPrimary } from '@/src/components/buttons/Button'

export const ButtonConnect = styled(ButtonPrimary)`
  column-gap: var(--theme-common-space);
  display: none;
  font-size: 1.4rem;
  font-weight: 600;
  height: 40px;
  padding: 0 calc(var(--theme-common-space) * 2.5);
  position: relative;

  .isOpen & {
    background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColorHover};
    border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColorHover};
    color: ${({ theme: { buttonPrimary } }) => buttonPrimary.colorHover};
  }

  &:active {
    opacity: 1;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    display: flex;
  }
`
