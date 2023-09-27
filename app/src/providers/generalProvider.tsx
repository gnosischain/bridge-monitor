import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

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
  /**
   * Try to determine if the current section has tabs using the router's pathname.
   * 'transactions' is forced for the index page '/' or ''
   */
  const currentSectionPathName = useMemo(
    () => router.pathname.replace('/', '') || 'transactions',
    [router.pathname],
  )
  const currentSection = useMemo(() => tabs[currentSectionPathName], [currentSectionPathName])
  const [activeTab, setActiveTab] = useState<string>('')
  const [isTimeAgo, setIsTimeAgo] = useState<boolean>(true)

  useEffect(() => {
    const activeTabisNotInCurrentSection = currentSection
      ? !currentSection.find(({ title }) => title === activeTab)
      : false

    const handleRouteChange = () => {
      if (currentSection && currentSection.length && activeTabisNotInCurrentSection) {
        setActiveTab(currentSection[0].title)
      }
    }

    handleRouteChange()

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [activeTab, currentSection, router.events])

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
