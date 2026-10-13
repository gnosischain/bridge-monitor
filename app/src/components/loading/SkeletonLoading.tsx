import { CSSProperties, PropsWithChildren } from 'react'
import styled, { css, keyframes } from 'styled-components'

const loadingAnimation = keyframes`
  0% {
    background-color: var(--background-color-start);
  }

  50% {
    background-color: var(--background-color-end);
  }

  100% {
    background-color: var(--background-color-start);
  }
`

interface SkeletonProps extends PropsWithChildren<unknown> {
  $animate?: boolean
  $animationDuration?: string
  style?: CSSProperties
}

const AnimationCSS = css<SkeletonProps>`
  --background-color-start: ${({ theme: { colors } }) => colors.lilac};
  --background-color-end: ${({ theme: { colors } }) => colors.line};

  animation-delay: 0;
  animation-duration: ${({ $animationDuration }) => `${$animationDuration}`};
  animation-iteration-count: infinite;
  animation-name: ${loadingAnimation};
  animation-timing-function: ease-in-out;
`

export const SkeletonLoading = styled.div<SkeletonProps>`
  ${({ $animate }) => $animate && AnimationCSS}
  background-color: ${({ $animate, theme: { colors } }) =>
    $animate ? 'var(--background-color-start)' : colors.line};
  border-radius: 10px;
  min-height: 20px;
  min-width: 50px;
  width: 100%;
`

SkeletonLoading.defaultProps = {
  $animate: true,
  $animationDuration: '2s',
}
