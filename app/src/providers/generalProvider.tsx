import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react'

import { tabs } from '@/src/constants/tabs'

interface GeneralContextType {
  activeTab: string
  isTimeAgo: boolean
  setActiveTab: Dispatch<SetStateAction<string>>
  setIsTimeAgo: Dispatch<SetStateAction<boolean>>
}

export const GeneralContext = createContext({} as GeneralContextType)

const GeneralContextProvider: React.FC = ({ children }) => {
  const router = useRouter()
  const currentSection = router.pathname.replace('/', '') || 'transactions'
  const sectionHasTabs = currentSection in tabs && tabs[currentSection].length

  const [activeTab, setActiveTab] = useState<string>('')
  const [isTimeAgo, setIsTimeAgo] = useState<boolean>(true)

  useEffect(() => {
    if (sectionHasTabs) {
      setActiveTab(tabs[currentSection][0].title)
    }
  }, [currentSection, sectionHasTabs])

  const initialValues = {
    activeTab,
    isTimeAgo,
    setActiveTab,
    setIsTimeAgo,
  }

  return <GeneralContext.Provider value={initialValues}>{children}</GeneralContext.Provider>
}

export default GeneralContextProvider

export function useGeneral(): GeneralContextType {
  return useContext(GeneralContext)
}
