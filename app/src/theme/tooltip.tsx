import { css } from 'styled-components'

export const tooltipCSS = css`
  :root {
    .customTooltip {
      background-color: ${({ theme: { colors } }) => colors.primaryDark};
      border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
      color: ${({ theme: { colors } }) => colors.cream};
      font-size: 1.4rem;
      font-weight: 400;
      line-height: 1.3;
      max-width: 350px;
      padding: calc(var(--theme-common-space) * 2);

      a {
        color: ${({ theme: { colors } }) => colors.cream};
        text-decoration: underline;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }
`
