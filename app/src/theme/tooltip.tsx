import { css } from 'styled-components'

export const tooltipCSS = css`
  :root {
    .customTooltip {
      background-color: ${({ theme: { colors } }) => colors.ink};
      border-radius: ${({ theme: { common } }) => common.borderRadius};
      color: ${({ theme: { colors } }) => colors.surface};
      font-size: 1.3rem;
      font-weight: 400;
      line-height: 1.4;
      max-width: 320px;
      padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);

      a {
        color: ${({ theme: { colors } }) => colors.surface};
        text-decoration: underline;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }
`
