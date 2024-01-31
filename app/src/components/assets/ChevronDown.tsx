import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  display: block;
  flex-shrink: 0;
`

export const ChevronDown: React.FC<HTMLAttributes<SVGElement>> = ({ className, ...restProps }) => (
  <Wrapper
    className={`chevronDown ${className}`}
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      clipRule="evenodd"
      d="M8.4842 11.4842L13.4904 6.47796L13.4965 6.47151C13.651 6.30564 13.7352 6.08625 13.7312 5.85956C13.7272 5.63288 13.6353 5.4166 13.475 5.25628C13.3147 5.09597 13.0984 5.00414 12.8717 5.00014C12.645 4.99614 12.4257 5.08028 12.2598 5.23484L12.2533 5.24084L7.86565 9.62796L3.47795 5.24084L3.47151 5.23484C3.30564 5.08028 3.08625 4.99614 2.85956 5.00014C2.63288 5.00414 2.4166 5.09597 2.25628 5.25628C2.09597 5.4166 2.00414 5.63288 2.00014 5.85956C1.99614 6.08625 2.08028 6.30564 2.23484 6.47151L2.24085 6.47796L7.24731 11.4844C7.41138 11.6483 7.63377 11.7403 7.86565 11.7403C8.09752 11.7403 8.32014 11.6481 8.4842 11.4842Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </Wrapper>
)
