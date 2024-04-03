import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;
  row-gap: calc(var(--theme-common-space) * 2);
`

export const Sidebar: React.FC = ({ children, ...restProps }) => {
  return <Wrapper {...restProps}>{children}</Wrapper>
}

Sidebar.defaultProps = {
  className: 'sidebar',
}
