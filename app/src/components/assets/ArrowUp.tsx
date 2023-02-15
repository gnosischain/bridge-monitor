import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  display: block;
  flex-shrink: 0;
`

export const ArrowUp: React.FC<HTMLAttributes<SVGElement>> = ({ className, ...restProps }) => (
  <Wrapper
    className={`arrowUp ${className}`}
    fill="none"
    height="10"
    viewBox="0 0 10 10"
    width="10"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      clipRule="evenodd"
      d="M5 0C5.34518 0 5.625 0.279822 5.625 0.625V9.375C5.625 9.72018 5.34518 10 5 10C4.65482 10 4.375 9.72018 4.375 9.375V0.625C4.375 0.279822 4.65482 0 5 0Z"
      fill="#F0EBDE"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M0.183058 4.55806C0.427136 4.31398 0.822864 4.31398 1.06694 4.55806L5 8.49112L8.93306 4.55806C9.17713 4.31398 9.57286 4.31398 9.81694 4.55806C10.061 4.80214 10.061 5.19786 9.81694 5.44194L5.44194 9.81694C5.19786 10.061 4.80214 10.061 4.55806 9.81694L0.183058 5.44194C-0.0610194 5.19786 -0.0610194 4.80214 0.183058 4.55806Z"
      fill="#F0EBDE"
      fillRule="evenodd"
    />
  </Wrapper>
)
