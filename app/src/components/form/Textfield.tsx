import { InputHTMLAttributes } from 'react'
import { DebounceInputProps } from 'react-debounce-input'
import styled, { css } from 'styled-components'

export enum TextfieldStatus {
  error = 'error',
  success = 'success',
}

// interface TextfieldCSSProps {
//   status?: TextfieldStatus | undefined
// }

// export interface TextfieldProps extends InputHTMLAttributes<HTMLInputElement>, TextfieldCSSProps {}

export type TextfieldCSSProps = {
  status?: 'error' | 'success'
  autoComplete?: string
  autoCorrect?: string
  spellCheck?: string
  className?: string
  id?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  theme: {
    textField: {
      active: {
        backgroundColor: string
        borderColor: string
        boxShadow: string
        color: string
      }
      errorColor: string
      successColor: string
      backgroundColor: string
      borderColor: string
      color: string
      height: string
      placeholder: {
        color: string
      }
    }
  }
}

export type TextfieldProps = DebounceInputProps<
  InputHTMLAttributes<HTMLInputElement>,
  TextfieldCSSProps
>

export const TextfieldPartsCSS = css<TextfieldCSSProps>`
  &:active,
  &:focus {
    background-color: ${({ theme: { textField } }) => textField.active.backgroundColor};
    border-color: ${({ status, theme: { textField } }) =>
      status === TextfieldStatus.error
        ? textField.errorColor
        : status === TextfieldStatus.success
        ? textField.successColor
        : textField.active.borderColor};
    box-shadow: ${({ theme: { textField } }) => textField.active.boxShadow};
    color: ${({ status, theme: { textField } }) =>
      status === TextfieldStatus.error ? textField.errorColor : textField.color};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme: { textField } }) => textField.backgroundColor};
    border-color: ${({ theme: { textField } }) => textField.borderColor};
    color: ${({ theme: { textField } }) => textField.active.color};
    cursor: not-allowed;
    opacity: 0.5;
  }

  &[disabled]::placeholder,
  &[disabled]:hover::placeholder {
    color: ${({ theme: { textField } }) => textField.color}!important;
  }

  &::placeholder {
    color: ${({ theme: { textField } }) => textField.placeholder.color};
    font-size: var(--texfield-font-size);
    font-style: normal;
    font-weight: var(--textfield-font-weight);
    opacity: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &[readonly] {
    background-color: ${({ theme: { textField } }) => textField.backgroundColor};
    border-color: ${({ theme: { textField } }) => textField.borderColor};
    color: ${({ theme: { textField } }) => textField.placeholder.color};
    cursor: default;
    font-style: normal;
  }

  &[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;

    ::-webkit-inner-spin-button,
    ::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &::-webkit-search-decoration {
    -webkit-appearance: none;
  }
`

export const TextfieldCSS = css<TextfieldCSSProps>`
  --textfield-border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  --texfield-font-size: 1.3rem;
  --textfield-padding: 0 var(--theme-common-space);
  --textfield-height: ${({ theme: { textField } }) => textField.height};
  --textfield-font-weight: 400;

  background-color: ${({ theme: { textField } }) => textField.backgroundColor};
  border-color: ${({ status, theme: { textField } }) =>
    status === TextfieldStatus.error
      ? textField.errorColor
      : status === TextfieldStatus.success
      ? textField.successColor
      : textField.borderColor};
  border-radius: var(--textfield-border-radius);
  border-style: solid;
  border-width: 0.5px;
  color: ${({ status, theme: { textField } }) =>
    status === TextfieldStatus.error ? textField.errorColor : textField.color};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: var(--texfield-font-size);
  font-weight: var(--textfield-font-weight);
  height: var(--textfield-height);
  outline: none;
  overflow: hidden;
  padding: var(--textfield-padding);
  text-overflow: ellipsis;
  transition: border-color 0.15s linear, background-color 0.15s linear;
  white-space: nowrap;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    --texfield-font-size: 1.4rem;
    --textfield-padding: 0 calc(var(--theme-common-space) * 2);
  }
`

export const Textfield = styled.input<TextfieldProps>`
  ${TextfieldCSS}
  ${TextfieldPartsCSS}
`
