import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  .stroke {
    stroke: #161d1a;
    stroke-width: 1.2;
  }
`

interface Props {
  height?: number
  width?: number
  strokeWidth?: number
}

export const IconCheck: React.FC<Props> = ({ height = 8, strokeWidth = 1.2, width = 9 }) => (
  <Wrapper
    className="check"
    fill="none"
    height={height}
    viewBox="0 0 9 8"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.23635 1.5L3.23635 6.5L0.963623 4.22727"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  </Wrapper>
)
