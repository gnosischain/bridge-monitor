import styled from 'styled-components'

import { BridgeLimit } from '@/src/components/limits/BridgeLimit'
import { TabContentInner } from '@/src/components/tabs/TabContentInner'
import { BaseSubTitle } from '@/src/components/text/BaseSubTitle'
import { useTokenIcons } from '@/src/providers/tokenIconsProvider'

const Wrapper = styled(TabContentInner)``

const Columns = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

export const DailyBridgeLimits: React.FC = ({ ...restProps }) => {
  const { tokensBySymbol } = useTokenIcons()

  return (
    <Wrapper {...restProps}>
      <div>
        <BaseSubTitle>xDai</BaseSubTitle>
        <Columns>
          <BridgeLimit
            bridgeReset={1667054970000}
            contractForeignFunds={10000000}
            contractForeignUsed={3500000}
            contractNativeFunds={10000000}
            contractNativeUsed={2010000}
            defaultToken={tokensBySymbol['dai']}
            disableTokenDropdown
            fromTo={'Ethereum to Gnosis'}
            title="ETH -> GC"
            url="https://github.com/"
          />
          <BridgeLimit
            bridgeReset={1666442910000}
            contractForeignFunds={10000000}
            contractForeignUsed={4020000}
            contractNativeFunds={10000000}
            contractNativeUsed={5100000}
            defaultToken={tokensBySymbol['xdao']}
            disableTokenDropdown
            fromTo={'Gnosis to Ethereum'}
            title="GC -> ETH"
            url="https://github.com/"
          />
        </Columns>
      </div>
      <div>
        <BaseSubTitle>Omnibridge</BaseSubTitle>
        <Columns>
          <BridgeLimit
            bridgeReset={1666882170000}
            contractForeignFunds={10000000}
            contractForeignUsed={7200000}
            contractNativeFunds={10000000}
            contractNativeUsed={5010000}
            defaultToken={tokensBySymbol['dai']}
            fromTo={'Ethereum to Gnosis'}
            title="ETH -> GC"
            url="https://github.com/"
          />
          <BridgeLimit
            bridgeReset={1666450170000}
            contractForeignFunds={10000000}
            contractForeignUsed={4200000}
            contractNativeFunds={10000000}
            contractNativeUsed={8100000}
            defaultToken={tokensBySymbol['xdao']}
            fromTo={'Gnosis to Ethereum'}
            title="GC -> ETH"
            url="https://github.com/"
          />
        </Columns>
      </div>
    </Wrapper>
  )
}
