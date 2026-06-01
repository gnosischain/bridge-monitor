import { ReactElement } from 'react'
import styled from 'styled-components'

import { BridgeFormIndex } from '@/src/pagePartials/bridge/bridgeForm'
import type { NextPageWithLayout } from '@/pages/_app'
import { BridgeLayout } from '@/src/pagePartials/bridge/layout/BridgeLayout'
import { WarningBanner } from '@/src/components/banner/WarningBanner'

const Content = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
  width: 100%;
`

const HomePage: NextPageWithLayout = () => (
  <Content>
    <WarningBanner>
      In response to the ongoing hack related to Gnosis Pay&apos;s Delay module, the bridging
      service is currently on pause. For any latest update, please check{' '}
      <a href="https://x.com/gnosischain" rel="noreferrer" target="_blank">
        https://x.com/gnosischain
      </a>
    </WarningBanner>
    <BridgeFormIndex />
  </Content>
)

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <BridgeLayout>{page}</BridgeLayout>
}

export default HomePage
