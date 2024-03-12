import { SidebarLayout } from '@/src/components/sidebarLayout'
import { Search } from '@/src/pagePartials/bridge/sidebar/Search'
import { ExternalLinks } from '@/src/pagePartials/bridge/sidebar/ExternalLinks'
import { PropsWithChildren } from 'react'

export const BridgeLayout: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <SidebarLayout
      sidebarContents={
        <>
          <Search />
          <ExternalLinks />
        </>
      }
      sidebarPlacement="right"
    >
      {children}
    </SidebarLayout>
  )
}
