import styled from 'styled-components'
import { ButtonPrimary } from '@/src/components/buttons/Button'

export const ButtonConnect = styled(ButtonPrimary)`
  column-gap: 16px;
  display: none;
  font-size: 1.3rem;
  height: 38px;
  padding: 0 16px;
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

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    font-size: 1.5rem;
    height: 48px;
  }
`
