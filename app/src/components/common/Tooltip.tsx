import React, { useState } from 'react'
import styled from 'styled-components'

import { AnimatePresence, motion } from 'framer-motion'

const Wrapper = styled.div`
  font-size: 0;
  line-height: 0;
  position: relative;
  z-index: 10;
`

const TooltipWrapper = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.black};
  border-radius: ${({ theme: { common } }) => common.space / 2}px;
  bottom: calc(100% + 5px);
  color: ${({ theme }) => theme.colors.white};
  display: inline-block;
  font-size: 1.2rem;
  left: 0;
  line-height: 1.5;
  max-width: 180px;
  padding: ${({ theme: { common } }) => common.space / 4}px
    ${({ theme: { common } }) => common.space}px;
  position: absolute;
  white-space: pre-line;
  width: max-content;
`

interface Props {
  text: string
}

export const Tooltip: React.FC<Props> = ({ children, text, ...restProps }) => {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <Wrapper {...restProps}>
      <AnimatePresence initial={true}>
        {isHovering && (
          <TooltipWrapper
            animate={{ opacity: 1, y: '0' }}
            initial={{ opacity: 0, y: '-10px' }}
            transition={{ duration: 0.1, type: 'spring', stiffness: 1360, damping: 150 }}
          >
            {text}
          </TooltipWrapper>
        )}
      </AnimatePresence>
      <div
        onMouseEnter={() => {
          {
            setIsHovering(true)
          }
        }}
        onMouseLeave={() => {
          {
            setIsHovering(false)
          }
        }}
      >
        {children}
      </div>
    </Wrapper>
  )
}
