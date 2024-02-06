import { ReactElement } from 'react'
import { SidebarLayout } from '@/src/components/sidebarLayout'
import { BridgeIndex } from '@/src/pagePartials/bridge'
import type { NextPageWithLayout } from '@/pages/_app'
import { Search } from '@/src/pagePartials/bridge/sidebar/Search'
import { ExternalLinks } from '@/src/pagePartials/bridge/sidebar/ExternalLinks'

const HomePage: NextPageWithLayout = () => {
  return <BridgeIndex />
}

HomePage.getLayout = function getLayout(page: ReactElement) {
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
      {page}
    </SidebarLayout>
  )
}

export default HomePage
