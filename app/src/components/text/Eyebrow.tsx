import styled, { css } from 'styled-components'

// The small uppercase label gnosis.io puts above titles, values and link groups.
export const EyebrowCSS = css`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  line-height: 1.4;
  text-transform: uppercase;
`

export const Eyebrow = styled.p`
  ${EyebrowCSS}
  margin: 0;
`
