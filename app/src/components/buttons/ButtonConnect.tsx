import styled from 'styled-components'
import { ButtonPrimary } from '@/src/components/buttons/Button'

export const ButtonConnect = styled(ButtonPrimary)`
  column-gap: calc(var(--theme-common-space) * 2);
  display: none;
  font-size: 1.3rem;
  font-weight: 500;
  height: 48px;
  padding: 0 calc(var(--theme-common-space) * 2);
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
    font-size: 1.4rem;
    height: 48px;
  }
`
