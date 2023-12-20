import { ReactElement } from 'react'
import { SidebarLayout } from '@/src/components/layout/SidebarLayout'
import { BridgeIndex } from '@/src/pagePartials/bridge'
import type { NextPageWithLayout } from '@/pages/_app'

const HomePage: NextPageWithLayout = () => {
  return <BridgeIndex />
}

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <SidebarLayout sidebarPlacement="right">{page}</SidebarLayout>
}

export default HomePage
