import { SidebarLayout } from '@/src/components/sidebarLayout'
import { Success } from '@/src/pagePartials/bridge/Success'
import { Search } from '@/src/pagePartials/bridge/sidebar/Search'
import { ExternalLinks } from '@/src/pagePartials/bridge/sidebar/ExternalLinks'
import { ReactElement } from 'react'
import TokenListProvider from '@/src/providers/tokenListProvider'

const BridgeProgressPage = () => {
  return (
    <TokenListProvider>
      <Success />
    </TokenListProvider>
  )
}

BridgeProgressPage.getLayout = function getLayout(page: ReactElement) {
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

export default BridgeProgressPage
