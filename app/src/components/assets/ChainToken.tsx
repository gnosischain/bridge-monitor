import { ReactNode } from 'react'
import styled from 'styled-components'

// import { Tooltip } from '@/src/components/assets/Tooltip'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme: { common } }) => common.space / 2}px;
  position: relative;
  z-index: 1;
  span:first-of-type {
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }
  strong {
    font-weight: 300;
    font-size: 1.4rem;
  }
`
interface Props {
  name: string
}

interface TooltipProps {
  text: string
  children: ReactNode
}

function Tooltip({ children, text }: TooltipProps) {
  return (
    <div className="tooltip">
      <span className="tooltip-text">{text}</span>
      {children}
    </div>
  )
}

export const ChainToken: React.FC<Props> = ({ children, name }) => {
  return (
    <Wrapper>
      <Tooltip text={name}>{children}</Tooltip>
    </Wrapper>
  )
}
