import { css } from 'styled-components'

export const StatusColors = {
  CLAIMED: css`
    ${({ theme: { colors } }) => colors.darkGreen};
  `,
  COLLECTING: css`
    ${({ theme: { colors } }) => colors.lightYellow};
  `,
  COMPLETED: css`
    ${({ theme: { colors } }) => colors.successDark};
  `,
  ERROR: css`
    ${({ theme: { colors } }) => colors.error};
  `,
  INITIATED: css`
    ${({ theme: { colors } }) => colors.secondary};
  `,
  REQUESTED: css`
    ${({ theme: { colors } }) => colors.cream};
  `,
  UNCLAIMED: css`
    ${({ theme: { colors } }) => colors.warning};
  `,
  DEFAULT: css`
    ${({ theme: { colors } }) => colors.darkerGray};
  `,
}
