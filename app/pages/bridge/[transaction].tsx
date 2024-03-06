import { BridgingStatus, Loading } from '@/src/pagePartials/bridge/bridgingStatus/BridgingStatus'
import { ReactElement } from 'react'
import { BridgeLayout } from '@/src/pagePartials/bridge/layout/BridgeLayout'
import SafeSuspense from '@/src/components/safeSuspense'
import { Wrapper } from '@/src/pagePartials/bridge/common/Wrapper'
import TokenListProvider from '@/src/providers/tokenListProvider'

const BridgeProgressPage = () => (
  <SafeSuspense
    fallback={
      <Wrapper>
        <Loading />
      </Wrapper>
    }
  >
    <TokenListProvider>
      <BridgingStatus />
    </TokenListProvider>
  </SafeSuspense>
)

BridgeProgressPage.getLayout = function getLayout(page: ReactElement) {
  return <BridgeLayout>{page}</BridgeLayout>
}

export default BridgeProgressPage
