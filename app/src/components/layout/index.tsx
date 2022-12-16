import { useRouter } from 'next/router'

import { AnimatePresence, motion } from 'framer-motion'

import { InnerContainer } from '@/src/components/helpers/InnerContainer'

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
      <InnerContainer
        animate="enter"
        as={motion.main}
        initial="hidden"
        key={router.pathname}
        variants={variantsBox}
      >
        <AnimatePresence exitBeforeEnter>
          <motion.div animate="enter" initial="hidden" key={router.pathname} variants={variants}>
            {children}
          </motion.div>
        </AnimatePresence>
      </InnerContainer>
    </AnimatePresence>
  )
}
