import React from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { useGeneral } from '@/src/providers/generalProvider'

interface Props {
  title: string
}

export const TabContent: React.FC<Props> = ({ children, title }) => {
  const { activeTab } = useGeneral()

  return title == activeTab ? (
    <>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          initial={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
      </AnimatePresence>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          initial={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  ) : (
    <></>
  )
}
