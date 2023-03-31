import React, { useState } from 'react'
import styled from 'styled-components'

import { AnimatePresence, motion } from 'framer-motion'

const Wrapper = styled.div`
  position: relative;
  z-index: 10;
  font-size: 0;
  line-height: 0;
`
const TooltipWrapper = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.black};
  border-radius: ${({ theme: { common } }) => common.space / 2}px;
  color: ${({ theme }) => theme.colors.white};
  display: inline-block;
  font-size: 1.2rem;
  line-height: 1.5;
  padding: ${({ theme: { common } }) => common.space / 4}px
    ${({ theme: { common } }) => common.space}px;
  position: absolute;
  right: 100%;
  top: 0;
  margin-top: -4px;
  margin-right: 5px;
  max-width: 180px;
  width: max-content;
  white-space: pre-line;
`

interface Props {
  text: string
}

export const Tooltip: React.FC<Props> = ({ children, text }) => {
  const [isHovering, setIsHovering] = useState(false)
  return (
    <Wrapper>
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
