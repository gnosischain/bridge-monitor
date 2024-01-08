import styled, { css } from 'styled-components'
import { Button, DisabledButtonCSS } from '@/src/components/buttons/Button'

const IsOpenCSS = css`
  background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColorHover};
  border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColorHover};
  color: ${({ theme: { buttonDropdown } }) => buttonDropdown.colorHover};
`

export const ButtonDropdownCSS = css`
  background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColor};
  border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColor};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme: { buttonDropdown } }) => buttonDropdown.color};
  font-size: 1.3rem;
  font-weight: 500;
  height: ${({ theme: { textField } }) => textField.height};
  justify-content: space-between;
  padding: 0 calc(var(--theme-common-space) * 2);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.4rem;
  }

  &:hover {
    ${IsOpenCSS}
  }

  &::after {
    --dimensions: 8px;

    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIG9wYWNpdHk9Ii42IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTguNDMzLjg4MmEuNTcxLjU3MSAwIDAxMCAuODA4TDUuMDA0IDUuMTE4YS41NzEuNTcxIDAgMDEtLjgwOCAwTC43NjcgMS42OWEuNTcxLjU3MSAwIDExLjgwOS0uODA4TDQuNiAzLjkwNiA3LjYyNS44ODJhLjU3MS41NzEgMCAwMS44MDggMHoiIGZpbGw9IiMzRTY5NTciLz48L3N2Zz4=');
    background-position: 50% 50%;
    background-repeat: no-repeat;
    content: '';
    column-gap: 10px;
    height: var(--dimensions);
    transition: transform 0.1s linear;
    width: var(--dimensions);
  }

  .isOpen & {
    ${IsOpenCSS}
  }

  ${DisabledButtonCSS}

  &:active {
    opacity: 1;
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColor};
    border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColor};
    color: ${({ theme: { buttonDropdown } }) => buttonDropdown.color};
  }
`

export const ButtonDropdown = styled(Button)`
  ${ButtonDropdownCSS}
`
