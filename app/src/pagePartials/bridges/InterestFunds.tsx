import styled from 'styled-components'

import { InnerCard } from '@/src/components/common/InnerCard'
import { Omnibridge } from '@/src/pagePartials/interest/Omnibridge'
import { XDai } from '@/src/pagePartials/interest/XDai'
import { TabContentInner as Wrapper } from '@/src/components/tabs/Tabs'
import { BaseSubTitle } from '@/src/components/text/BaseSubTitle'

const Columns = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

export const InterestFunds: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <div>
      <BaseSubTitle>xDai</BaseSubTitle>
      <InnerCard>
        <XDai />
      </InnerCard>
    </div>
    <div>
      <BaseSubTitle>Omnibridge</BaseSubTitle>
      <Columns>
        <Omnibridge
          aaveTokenAddress="0x32dea44d5C243990B0133f5D103C2A784aA6a29F"
          currentEarnedInterest={1009.93}
          interestEarning={true}
          interestEarningImplementationAddress="0x32dea44d5C243990B0133f5D103C2A784aA6a29F"
          interestReceiverAddress="0x32dea44d5C243990B0133f5D103C2A784aA6a29F"
          minPaidInterestInASingleCall="1,083"
          minTokensNotInvested="992,192"
          tokenSymbol="usdc"
          tokensNotBeingInvested={811.928}
          underlyingTokensInvested={2092.329}
        />
        <Omnibridge
          aaveTokenAddress="0x32dea44d5C243990B0133f5D103C2A784aA6a29F"
          currentEarnedInterest={10023.28}
          interestEarning={false}
          interestEarningImplementationAddress="0x32dea44d5C243990B0133f5D103C2A784aA6a29F"
          interestReceiverAddress="0x32dea44d5C243990B0133f5D103C2A784aA6a29F"
          minPaidInterestInASingleCall="291,938"
          minTokensNotInvested="3,291,292"
          tokenSymbol="usdt"
          tokensNotBeingInvested={18129.008}
          underlyingTokensInvested={20292.39}
        />
      </Columns>
    </div>
  </Wrapper>
)
