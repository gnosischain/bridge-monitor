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
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { buttonDropdown } }) => buttonDropdown.color};
  font-size: 1.6rem;
  font-weight: 400;
  height: ${({ theme: { textField } }) => textField.height};
  justify-content: space-between;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 2);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
  }

  &:hover {
    ${IsOpenCSS}
  }

  &::after {
    --dimensions: 16px;

    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkNhcmV0RG93biI+CjxwYXRoIGlkPSJVbmlvbiIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04LjQ4NDIgMTEuNDg0MkwxMy40OTA0IDYuNDc3OTZMMTMuNDk2NSA2LjQ3MTUxQzEzLjY1MSA2LjMwNTY0IDEzLjczNTIgNi4wODYyNSAxMy43MzEyIDUuODU5NTZDMTMuNzI3MiA1LjYzMjg4IDEzLjYzNTMgNS40MTY2IDEzLjQ3NSA1LjI1NjI4QzEzLjMxNDcgNS4wOTU5NyAxMy4wOTg0IDUuMDA0MTQgMTIuODcxNyA1LjAwMDE0QzEyLjY0NSA0Ljk5NjE0IDEyLjQyNTcgNS4wODAyOCAxMi4yNTk4IDUuMjM0ODRMMTIuMjUzMyA1LjI0MDg0TDcuODY1NjUgOS42Mjc5NkwzLjQ3Nzk1IDUuMjQwODRMMy40NzE1MSA1LjIzNDg0QzMuMzA1NjQgNS4wODAyOCAzLjA4NjI1IDQuOTk2MTQgMi44NTk1NiA1LjAwMDE0QzIuNjMyODggNS4wMDQxNCAyLjQxNjYgNS4wOTU5NyAyLjI1NjI4IDUuMjU2MjhDMi4wOTU5NyA1LjQxNjYgMi4wMDQxNCA1LjYzMjg4IDIuMDAwMTQgNS44NTk1NkMxLjk5NjE0IDYuMDg2MjUgMi4wODAyOCA2LjMwNTY0IDIuMjM0ODQgNi40NzE1MUwyLjI0MDg1IDYuNDc3OTZMNy4yNDczMSAxMS40ODQ0QzcuNDExMzggMTEuNjQ4MyA3LjYzMzc3IDExLjc0MDMgNy44NjU2NSAxMS43NDAzQzguMDk3NTIgMTEuNzQwMyA4LjMyMDE0IDExLjY0ODEgOC40ODQyIDExLjQ4NDJaIiBmaWxsPSIjM0U2OTU3Ii8+CjwvZz4KPC9zdmc+Cg==');
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
