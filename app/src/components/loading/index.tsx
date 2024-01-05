import { DOMAttributes, HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Spinner } from '@/src/components/loading/Spinner'
import { motion } from 'framer-motion'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.4rem;
  line-height: 1.2;
  margin: 0;
  padding-top: 15px;
  text-align: center;
  width: 100%;
`

interface Props extends DOMAttributes<HTMLDivElement>, HTMLAttributes<HTMLDivElement> {
  text?: string
}

export const Loading: React.FC<Props> = ({ className, text = 'Loading...' }) => (
  <Wrapper
    animate={{ opacity: 1 }}
    as={motion.div}
    className={className}
    exit={{ opacity: 0 }}
    initial={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
  >
    <Spinner />
    <Text>{text}</Text>
  </Wrapper>
)
