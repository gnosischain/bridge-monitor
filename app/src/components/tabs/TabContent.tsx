import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { useGeneral } from '@/src/providers/generalProvider'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Loading } from '@/src/components/loading/Loading'

const Spinner = styled(Loading)`
  height: 200px;
`

interface Props {
  title: string
}

export const TabContent: React.FC<Props> = genericSuspense(
  ({ children, title }) => {
    const { activeTab } = useGeneral()

    return title == activeTab ? (
      <AnimatePresence exitBeforeEnter>
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          initial={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    ) : (
      <></>
    )
  },
  () => <Spinner />,
)
