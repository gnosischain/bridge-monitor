import styled, { css } from 'styled-components'

import { ThemeType } from '@/src/constants/types'

export const DisabledButtonCSS = css`
  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const ActiveButtonCSS = css`
  &:active {
    opacity: 0.7;
  }
`

export const ButtonCSS = css`
  align-items: center;
  border-radius: 30px;
  border-style: solid;
  border-width: 1px;
  column-gap: 10px;
  cursor: pointer;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.8rem;
  font-weight: 500;
  justify-content: center;
  line-height: 1;
  outline: none;
  padding: ${({ theme: { common } }) => common.space * 2}px
    ${({ theme: { common } }) => common.space * 4}px;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s ease-out;
  user-select: none;
  white-space: nowrap;

  ${ActiveButtonCSS}
`

const BaseButton = styled.button`
  ${ButtonCSS}
`

const BaseLink = styled.a`
  ${ButtonCSS}
`

export const Button = styled(BaseButton)`
  ${DisabledButtonCSS}
`

export const ButtonPrimaryCSS = css`
  background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColor};
  border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColor};
  color: ${({ theme: { buttonPrimary } }) => buttonPrimary.color};

  &:hover,
  &:focus {
    background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColorHover};
    border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColorHover};
    color: ${({ theme: { buttonPrimary } }) => buttonPrimary.colorHover};
  }

  ${DisabledButtonCSS}

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColor};
    border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColor};
    color: ${({ theme: { buttonPrimary } }) => buttonPrimary.color};
  }
`

export const ButtonSecondaryCSS = css`
  background-color: ${({ theme: { buttonSecondary } }) => buttonSecondary.backgroundColor};
  border-color: ${({ theme: { buttonSecondary } }) => buttonSecondary.borderColor};
  color: ${({ theme: { buttonSecondary } }) => buttonSecondary.color};

  &:hover,
  &:focus {
    background-color: ${({ theme: { buttonSecondary } }) => buttonSecondary.backgroundColorHover};
    border-color: ${({ theme: { buttonSecondary } }) => buttonSecondary.borderColorHover};
    color: ${({ theme: { buttonSecondary } }) => buttonSecondary.colorHover};
  }

  ${DisabledButtonCSS}

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme: { buttonSecondary } }) => buttonSecondary.backgroundColor};
    border-color: ${({ theme: { buttonSecondary } }) => buttonSecondary.borderColor};
    color: ${({ theme: { buttonSecondary } }) => buttonSecondary.color};
  }
`

export const ButtonPrimary = styled(BaseButton)`
  ${ButtonPrimaryCSS}
`

export const ButtonDropdownIsOpenCSS = css`
  &::after {
    transform: rotate(180deg);
  }
`

export const ButtonDropdownCSS = css<{ currentThemeName?: ThemeType }>`
  background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColor};
  border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColor};
  color: ${({ theme: { buttonDropdown } }) => buttonDropdown.color};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  font-size: 1.2rem;
  font-weight: 400;
  height: 36px;
  padding: 0 15px;
  width: 100%;
  justify-content: space-between;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 1.4rem;
  }
  &:hover {
    background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColorHover};
    border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColorHover};
    color: ${({ theme: { buttonDropdown } }) => buttonDropdown.colorHover};
  }

  &::after {
    --dimensions: 8px;
    content: '';
    background-position: 50% 50%;
    background-repeat: no-repeat;
    gap: 10px;
    height: var(--dimensions);
    width: var(--dimensions);
    ${({ currentThemeName }) =>
      currentThemeName === 'dark'
        ? css`
            background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuODMyNjMgMC44ODE2NjJDOC4wNTU3OSAxLjEwNDgyIDguMDU1NzkgMS40NjY2MyA3LjgzMjYzIDEuNjg5NzhMNC40MDQwNiA1LjExODM2QzQuMTgwOSA1LjM0MTUxIDMuODE5MSA1LjM0MTUxIDMuNTk1OTQgNS4xMTgzNkwwLjE2NzM2NyAxLjY4OTc4Qy0wLjA1NTc5IDEuNDY2NjMgLTAuMDU1NzkgMS4xMDQ4MiAwLjE2NzM2NyAwLjg4MTY2MkMwLjM5MDUyNCAwLjY1ODUwNSAwLjc1MjMzMyAwLjY1ODUwNSAwLjk3NTQ4OSAwLjg4MTY2Mkw0IDMuOTA2MTdMNy4wMjQ1MSAwLjg4MTY2MkM3LjI0NzY3IDAuNjU4NTA1IDcuNjA5NDggMC42NTg1MDUgNy44MzI2MyAwLjg4MTY2MloiIGZpbGw9IiNGMEVCREUiLz4KPC9zdmc+Cg==');
          `
        : css`
            background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuODMyNjMgMC44ODE2NjJDOC4wNTU3OSAxLjEwNDgyIDguMDU1NzkgMS40NjY2MyA3LjgzMjYzIDEuNjg5NzhMNC40MDQwNiA1LjExODM2QzQuMTgwOSA1LjM0MTUxIDMuODE5MSA1LjM0MTUxIDMuNTk1OTQgNS4xMTgzNkwwLjE2NzM2NyAxLjY4OTc4Qy0wLjA1NTc5IDEuNDY2NjMgLTAuMDU1NzkgMS4xMDQ4MiAwLjE2NzM2NyAwLjg4MTY2MkMwLjM5MDUyNCAwLjY1ODUwNSAwLjc1MjMzMyAwLjY1ODUwNSAwLjk3NTQ4OSAwLjg4MTY2Mkw0IDMuOTA2MTdMNy4wMjQ1MSAwLjg4MTY2MkM3LjI0NzY3IDAuNjU4NTA1IDcuNjA5NDggMC42NTg1MDUgNy44MzI2MyAwLjg4MTY2MloiIGZpbGw9IiNGMEVCREUiLz4KPC9zdmc+Cg==');
          `}
  }

  .isOpen & {
    ${ButtonDropdownIsOpenCSS}
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

export const ButtonDropdown = styled(Button)<{ currentThemeName?: ThemeType }>`
  ${ButtonDropdownCSS}
`

export const LinkButton = styled(BaseLink)`
  ${ButtonPrimaryCSS}
`
export const LinkSecondaryButton = styled(BaseLink)`
  ${ButtonSecondaryCSS}
`
