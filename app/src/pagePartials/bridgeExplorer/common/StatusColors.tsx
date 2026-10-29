import { css } from 'styled-components'

export const StatusColors = {
  CLAIMED: css`
    ${({ theme: { colors } }) => colors.success};
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
    ${({ theme: { colors } }) => colors.ink};
  `,
  UNCLAIMED: css`
    ${({ theme: { colors } }) => colors.violet};
  `,
  DEFAULT: css`
    ${({ theme: { colors } }) => colors.fog};
  `,
}

export const StatusBackgrounds = {
  CLAIMED: css`
    ${({ theme: { colors } }) => colors.successSoft};
  `,
  COLLECTING: css`
    ${({ theme: { colors } }) => colors.warningSoft};
  `,
  COMPLETED: css`
    ${({ theme: { colors } }) => colors.successSoft};
  `,
  ERROR: css`
    ${({ theme: { colors } }) => colors.errorSoft};
  `,
  INITIATED: css`
    ${({ theme: { colors } }) => colors.page};
  `,
  UNCLAIMED: css`
    ${({ theme: { colors } }) => colors.lilac};
  `,
  DEFAULT: css`
    ${({ theme: { colors } }) => colors.page};
  `,
}
