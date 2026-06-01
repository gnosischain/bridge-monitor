import React, { PropsWithChildren } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  /* Subtle tint of the warning color (colors.warning, #FAB754) for a bit more presence */
  background-color: rgba(250, 183, 84, 0.16);
  border: 1px solid ${({ theme: { colors } }) => colors.warning};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { colors } }) => colors.textColor};
  display: flex;
  font-size: 1.6rem;
  gap: calc(var(--theme-common-space) * 2);
  line-height: 1.4;
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
  width: 100%;

  a {
    color: ${({ theme: { colors } }) => colors.textColor};
    font-weight: 500;
    text-decoration: underline;
  }
`

export const WarningBanner: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
  <Wrapper>
    <span>{children}</span>
  </Wrapper>
)
