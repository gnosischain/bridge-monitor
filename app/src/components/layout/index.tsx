import { useRouter } from 'next/router'
import styled from 'styled-components'

import { AnimatePresence, motion } from 'framer-motion'

import { InnerContainer } from '@/src/components/helpers/InnerContainer'

const Container = styled(InnerContainer)`
  padding-bottom: ${({ theme: { common } }) => common.space * 8}px;
`

export const Layout: React.FC = ({ children }) => {
  const router = useRouter()
  const easing = [0.175, 0.85, 0.42, 0.96]
  const variants = {
    hidden: { opacity: 0, x: 0, y: -20 },
    enter: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.2,
        type: 'spring',
        damping: 20,
      },
    },
    exit: { y: 150, opacity: 0, transition: { duration: 0.5, ease: easing } },
  }
  const variantsBox = {
    hidden: { x: 0, y: -10 },
    enter: {
      y: 0,
      transition: {
        duration: 0.1,
        type: 'spring',
        bounce: 0.5,
      },
    },
    exit: { y: 150, opacity: 0, transition: { duration: 0.5, ease: easing } },
  }

  return (
    <AnimatePresence>
      <Container
        animate="enter"
        as={motion.div}
        initial="hidden"
        key={router.pathname}
        variants={variantsBox}
      >
        <AnimatePresence exitBeforeEnter>
          <motion.div animate="enter" initial="hidden" key={router.pathname} variants={variants}>
            {children}
          </motion.div>
        </AnimatePresence>
      </Container>
    </AnimatePresence>
  )
}
