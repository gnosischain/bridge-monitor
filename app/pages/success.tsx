import type { NextPage } from 'next'
import { SidebarLayout } from '@/src/components/sidebarLayout'
import { Success } from '@/src/pagePartials/bridge/Success'
import { Search } from '@/src/pagePartials/bridge/sidebar/Search'
import { ExternalLinks } from '@/src/pagePartials/bridge/sidebar/ExternalLinks'

const SuccessPage: NextPage = () => {
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
      <Success />
    </SidebarLayout>
  )
}

export default SuccessPage
