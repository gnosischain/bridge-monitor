import { css } from 'styled-components'

export const tooltipCSS = css`
  :root {
    .customTooltip {
      background-color: ${({ theme: { colors } }) => colors.black};
      border-radius: ${({ theme: { common } }) => common.space / 2}px;
      color: ${({ theme: { colors } }) => colors.white};
      font-size: 1.25rem;
      font-weight: 400;
      line-height: 1.3;
      max-width: 250px;
      padding: ${({ theme: { common } }) => common.space / 2}px
        ${({ theme: { common } }) => common.space}px;

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
