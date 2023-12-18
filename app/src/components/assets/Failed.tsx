import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  .fill {
    fill: #fff;
  }

  .stroke {
    stroke: ${({ theme: { colors } }) => colors.error};
  }
`

export const Failed: React.FC<HTMLAttributes<SVGElement>> = ({ className, ...restProps }) => (
  <Wrapper
    className={`failed ${className}`}
    fill="none"
    height="30"
    viewBox="0 0 30 30"
    width="30"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <rect className="fill" height="30" rx="15" width="30" />
    <path
      className="stroke"
      d="M14.9927 10V16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      className="stroke"
      d="M14.9927 20H15.0077"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </Wrapper>
)
