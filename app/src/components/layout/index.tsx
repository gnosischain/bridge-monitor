import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/layout/Footer'

export const Layout: React.FC = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
)
