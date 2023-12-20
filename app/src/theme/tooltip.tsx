import { css } from 'styled-components'

export const tooltipCSS = css`
  :root {
    .customTooltip {
      background-color: ${({ theme: { colors } }) => colors.black};
      border-radius: calc(var(--theme-common-space) / 2);
      color: ${({ theme: { colors } }) => colors.white};
      font-size: 1.25rem;
      font-weight: 400;
      line-height: 1.3;
      max-width: 250px;
      padding: calc(var(--theme-common-space) / 2) var(--theme-common-space);

      a {
        color: ${({ theme: { colors } }) => colors.white};
        text-decoration: underline;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }
`
