import { useRouter } from 'next/router'
import styled from 'styled-components'

import { motion } from 'framer-motion'
import { InnerContainer } from '@/src/components/innerContainer'

const Wrapper = styled(InnerContainer)`
  flex-grow: 1;
`

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  width: 100%;
`

export const SingleColumnLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const easing = [0.175, 0.85, 0.42, 0.96]
  const variantsMain = {
    hidden: { opacity: 1, x: 0, y: -25 },
    enter: {
      y: 0,
      opacity: 1,
      transition: {
        damping: 20,
        duration: 0.5,
        type: 'spring',
      },
    },
    exit: { y: 150, opacity: 0, transition: { duration: 0.2, ease: easing } },
  }

  return (
    <Wrapper>
      <Main
        animate="enter"
        as={motion.main}
        initial="hidden"
        key={router.pathname}
        variants={variantsMain}
      >
        {children}
      </Main>
    </Wrapper>
  )
}
