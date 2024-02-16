import styled, { css } from 'styled-components'

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
  column-gap: 16px;
  cursor: pointer;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.8rem;
  font-weight: 500;
  justify-content: center;
  line-height: 1;
  outline: none;
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 4);
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

Button.defaultProps = {
  type: 'button',
}

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
export const ButtonFullPrimaryCSS = css`
  ${ButtonPrimaryCSS}
  height: 70px;
  font-size: 1.8rem;
  font-weight: 700;
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  width: 100%;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 2.1rem;
    height: 80px;
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

ButtonPrimary.defaultProps = {
  type: 'button',
}

export const ButtonFull = styled(BaseButton)`
  ${ButtonFullPrimaryCSS}
`

ButtonFull.defaultProps = {
  type: 'button',
}

export const LinkButton = styled(BaseLink)`
  ${ButtonPrimaryCSS}
`

export const LinkFullPrimary = styled(BaseLink)`
  ${ButtonFullPrimaryCSS}
`

export const LinkSecondaryButton = styled(BaseLink)`
  ${ButtonSecondaryCSS}
`
