import { ThemeProvider } from 'styled-components'
import { theme } from '@/src/theme'
import { GlobalStyles } from '@/src/theme/globalStyles'

const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyles theme={theme} />
    {children}
  </ThemeProvider>
)

export default ThemeContextProvider
