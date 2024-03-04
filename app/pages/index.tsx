import { ReactElement } from 'react'
import { BridgeIndex } from '@/src/pagePartials/bridge/bridgeForm'
import type { NextPageWithLayout } from '@/pages/_app'
import { BridgeLayout } from '@/src/pagePartials/bridge/layout/BridgeLayout'

const HomePage: NextPageWithLayout = () => {
  return <BridgeIndex />
}

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <BridgeLayout>{page}</BridgeLayout>
}

export default HomePage
