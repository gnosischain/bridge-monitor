import { css } from 'styled-components'

export const StatusColors = {
  CLAIMED: css`
    ${({ theme: { colors } }) => colors.darkGreen};
  `,
  COLLECTING: css`
    ${({ theme: { colors } }) => colors.warning};
  `,
  COMPLETED: css`
    ${({ theme: { colors } }) => colors.success};
  `,
  ERROR: css`
    ${({ theme: { colors } }) => colors.error};
  `,
  INITIATED: css`
    ${({ theme: { colors } }) => colors.primary};
  `,
  UNCLAIMED: css`
    ${({ theme: { colors } }) => colors.darkSecondary};
  `,
  DEFAULT: css`
    ${({ theme: { colors } }) => colors.darkerGray};
  `,
}
