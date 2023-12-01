import styled from 'styled-components'

import { InnerCard } from '@/src/components/common/InnerCard'
import { Address } from '@/src/pagePartials/interest/Address'
import { Chart } from '@/src/pagePartials/interest/Chart'
import { InterestEarning } from '@/src/pagePartials/interest/InterestEarning'
import { Token } from '@/src/pagePartials/interest/Token'

const Wrapper = styled(InnerCard)``

const Title = styled.h3`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  margin: 0;
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 1.2;
  text-transform: uppercase;
`

const Columns = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

export const Omnibridge: React.FC<{
  aaveTokenAddress: string
  currentEarnedInterest: number
  interestEarning: boolean
  interestEarningImplementationAddress: string
  interestReceiverAddress: string
  minPaidInterestInASingleCall: string
  minTokensNotInvested: string
  tokenSymbol: string
  tokensNotBeingInvested: number
  underlyingTokensInvested: number
}> = ({
  aaveTokenAddress,
  currentEarnedInterest,
  interestEarning,
  interestEarningImplementationAddress,
  interestReceiverAddress,
  minPaidInterestInASingleCall,
  minTokensNotInvested,
  tokenSymbol,
  tokensNotBeingInvested,
  underlyingTokensInvested,
  ...restProps
}) => (
  <Wrapper {...restProps}>
    <Title>{tokenSymbol}</Title>
    <Columns>
      <InterestEarning enabled={interestEarning} />
      <Address
        address={interestReceiverAddress}
        title="Interest receiver address"
        tooltip="Configured address of the interest receiver."
      />
    </Columns>
    <Columns>
      <Address
        address={interestEarningImplementationAddress}
        title="Interest earning implementation address"
        tooltip="Address of the interest earning implementation for the specific token contract. If interest earning is disabled, will return 0x00..00"
      />
      <Address
        address={aaveTokenAddress}
        title="Protocol Token address"
        tooltip="Address configured for the protocol interest contract module."
      />
    </Columns>
    <Columns>
      <Token
        title="Min. tokens not invested"
        tokenSymbol={tokenSymbol}
        tooltip="The minimum amount of tokens that are not being invested."
        value={minTokensNotInvested}
      />
      <Token
        title="Min. paid interest in a single call"
        tokenSymbol={tokenSymbol}
        tooltip="The minimum amount of interest generated necessary to release a claim."
        value={minPaidInterestInASingleCall}
      />
    </Columns>
    <Chart
      currentEarnedInterest={currentEarnedInterest}
      tokenSymbol={tokenSymbol}
      tokensNotBeingInvested={tokensNotBeingInvested}
      underlyingTokensInvested={underlyingTokensInvested}
    />
  </Wrapper>
)
