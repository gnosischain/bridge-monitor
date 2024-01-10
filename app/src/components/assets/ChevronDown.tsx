import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  display: block;
  flex-shrink: 0;

  .fill {
    fill: ${({ theme: { colors } }) => colors.cream};
  }
`

export const ChevronDown: React.FC<HTMLAttributes<SVGElement>> = ({ className, ...restProps }) => (
  <Wrapper
    className={`chevronDown ${className}`}
    fill="none"
    height="6"
    viewBox="0 0 8 6"
    width="8"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      className="fill"
      clipRule="evenodd"
      d="M7.83263 0.881647C8.05579 1.1048 8.05579 1.46661 7.83263 1.68977L4.40406 5.11834C4.1809 5.3415 3.8191 5.3415 3.59594 5.11834L0.167367 1.68977C-0.05579 1.46661 -0.05579 1.1048 0.167367 0.881646C0.390524 0.65849 0.752333 0.65849 0.975489 0.881646L4 3.90616L7.02451 0.881647C7.24767 0.65849 7.60948 0.65849 7.83263 0.881647Z"
      fillRule="evenodd"
    />
  </Wrapper>
)
