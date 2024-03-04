import { BridgingStatus, Loading } from '@/src/pagePartials/bridge/bridgingStatus/BridgingStatus'
import { ReactElement } from 'react'
import TokenListProvider from '@/src/providers/tokenListProvider'
import { BridgeLayout } from '@/src/pagePartials/bridge/layout/BridgeLayout'
import { genericSuspense } from '@/src/components/safeSuspense'
import { Wrapper } from '@/src/pagePartials/bridge/common/Wrapper'

const BridgeProgressPageSuspense = genericSuspense(
  () => {
    return (
      <TokenListProvider>
        <BridgingStatus />
      </TokenListProvider>
    )
  },
  () => (
    <Wrapper>
      <Loading />
    </Wrapper>
  ),
)

const BridgeProgressPage = () => {
  return <BridgeProgressPageSuspense />
}

BridgeProgressPage.getLayout = function getLayout(page: ReactElement) {
  return <BridgeLayout>{page}</BridgeLayout>
}

export default BridgeProgressPage
