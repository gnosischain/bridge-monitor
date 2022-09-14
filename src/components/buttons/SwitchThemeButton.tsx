import { ButtonHTMLAttributes } from 'react'
import styled, { css, keyframes } from 'styled-components'

import { DarkMode } from '@/src/components/assets/DarkMode'
import { LightMode } from '@/src/components/assets/LightMode'
import { ActiveButtonCSS, DisabledButtonCSS } from '@/src/components/buttons/Button'
import { ThemeType } from '@/src/constants/types'

const Wrapper = styled.button`
  --dimensions: 32px;

  align-items: center;
  background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColor};
  border-radius: 50%;
  border: 1px solid ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColor};
  cursor: pointer;
  display: flex;
  height: var(--dimensions);
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease-out;
  width: var(--dimensions);

  &:hover {
    background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColorHover};
    border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColorHover};
  }

  ${ActiveButtonCSS}
  ${DisabledButtonCSS}
`

const spinningAnimation = keyframes`
  0% {
    transform: rotate(0deg)
  }

  50% {
    transform: rotate(180deg)
  }

  100% {
    transform: rotate(359deg)
  }
`

const SpinningCSS = css`
  animation-duration: 0.08s;
  animation-iteration-count: 2;
  animation-name: ${spinningAnimation};
  animation-timing-function: linear;
`

const DarkModeSVG = styled(DarkMode)`
  ${SpinningCSS}
`

const LightModeSVG = styled(LightMode)`
  ${SpinningCSS}
`

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  currentThemeName?: ThemeType
}

export const SwitchThemeButton: React.FC<Props> = ({ currentThemeName, ...restProps }) => (
  <Wrapper {...restProps}>
    {currentThemeName === ThemeType.dark && <LightModeSVG />}
    {currentThemeName === ThemeType.light && <DarkModeSVG />}
  </Wrapper>
)
