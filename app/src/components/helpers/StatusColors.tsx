import { css } from 'styled-components'

export const StatusColors = {
  CLAIMED: css`
    background-color: ${({ theme: { colors } }) => colors.darkGreen};
  `,
  COLLECTING: css`
    background-color: ${({ theme: { colors } }) => colors.lightYellow};
  `,
  COMPLETED: css`
    background-color: ${({ theme: { colors } }) => colors.successDark};
  `,
  ERROR: css`
    background-color: ${({ theme: { colors } }) => colors.error};
  `,
  INITIATED: css`
    background-color: ${({ theme: { colors } }) => colors.secondary};
  `,
  REQUESTED: css`
    background-color: ${({ theme: { colors } }) => colors.cream};
  `,
  UNCLAIMED: css`
    background-color: ${({ theme: { colors } }) => colors.warning};
  `,
  DEFAULT: css`
    background-color: ${({ theme: { colors } }) => colors.darkerGray};
  `,
}
