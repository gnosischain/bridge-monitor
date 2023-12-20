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

    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuODMyNjMgMC44ODE2NjJDOC4wNTU3OSAxLjEwNDgyIDguMDU1NzkgMS40NjY2MyA3LjgzMjYzIDEuNjg5NzhMNC40MDQwNiA1LjExODM2QzQuMTgwOSA1LjM0MTUxIDMuODE5MSA1LjM0MTUxIDMuNTk1OTQgNS4xMTgzNkwwLjE2NzM2NyAxLjY4OTc4Qy0wLjA1NTc5IDEuNDY2NjMgLTAuMDU1NzkgMS4xMDQ4MiAwLjE2NzM2NyAwLjg4MTY2MkMwLjM5MDUyNCAwLjY1ODUwNSAwLjc1MjMzMyAwLjY1ODUwNSAwLjk3NTQ4OSAwLjg4MTY2Mkw0IDMuOTA2MTdMNy4wMjQ1MSAwLjg4MTY2MkM3LjI0NzY3IDAuNjU4NTA1IDcuNjA5NDggMC42NTg1MDUgNy44MzI2MyAwLjg4MTY2MloiIGZpbGw9IiNGMEVCREUiLz4KPC9zdmc+Cg==');
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
