import styled from 'styled-components'

import { BridgeLimit } from '@/src/components/limits/BridgeLimit'

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

export const Limits: React.FC = () => {
  return (
    <section>
      <Columns>
        <BridgeLimit
          bridge="xDAI"
          bridgeReset={1667054970000}
          contractForeignFunds={10000000}
          contractForeignUsed={3500000}
          contractNativeFunds={10000000}
          contractNativeUsed={2010000}
          limitLabel="Daily limit"
        />
        <BridgeLimit
          bridge="xDAI"
          bridgeReset={1666442910000}
          contractForeignFunds={10000000}
          contractForeignUsed={4020000}
          contractNativeFunds={10000000}
          contractNativeUsed={5100000}
          limitLabel="Execution daily limit"
        />
        <BridgeLimit
          bridge="Omnibridge"
          bridgeReset={1666882170000}
          contractForeignFunds={10000000}
          contractForeignUsed={7200000}
          contractNativeFunds={10000000}
          contractNativeUsed={5010000}
          limitLabel="Daily limit"
        />
        <BridgeLimit
          bridge="Omnibridge"
          bridgeReset={1666450170000}
          contractForeignFunds={10000000}
          contractForeignUsed={4200000}
          contractNativeFunds={10000000}
          contractNativeUsed={8100000}
          limitLabel="Execution daily limit"
        />
      </Columns>
    </section>
  )
}
