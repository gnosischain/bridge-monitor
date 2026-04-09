import { createContext, useContext } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/src/theme'
import { GlobalStyles } from '@/src/theme/globalStyles'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ThemeContext = createContext({} as any)

const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentThemeJSON = theme

  return (
    <ThemeContext.Provider value={{}}>
      <ThemeProvider theme={currentThemeJSON}>
        <GlobalStyles theme={currentThemeJSON} />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider

export function useThemeContext() {
  return useContext(ThemeContext)
}
