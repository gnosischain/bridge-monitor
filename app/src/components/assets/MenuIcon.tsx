import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  color: ${({ theme: { colors } }) => colors.primary};
  display: block;
  flex-shrink: 0;
`

export const MenuIcon: React.FC<HTMLAttributes<SVGElement>> = (props) => {
  const { className, ...restProps } = props

  return (
    <Wrapper
      className={`menuIcon ${className}`}
      fill="none"
      height="15"
      viewBox="0 0 24 15"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <rect fill="currentColor" height="2" rx="1" width="24" y="0.329102" />
      <rect fill="currentColor" height="2" rx="1" width="24" y="6.3291" />
      <rect fill="currentColor" height="2" rx="1" width="24" y="12.3291" />
    </Wrapper>
  )
}
