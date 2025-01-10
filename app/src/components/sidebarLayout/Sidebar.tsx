import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;
  row-gap: calc(var(--theme-common-space) * 2);
`

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className = 'sidebar',
  ...restProps
}) => {
  return (
    <Wrapper className={className} {...restProps}>
      {children}
    </Wrapper>
  )
}
