import styled from 'styled-components'

import { InnerCard } from '@/src/components/common/InnerCard'
import { Address } from '@/src/components/interest/Address'
import { Chart } from '@/src/components/interest/Chart'
import { InterestEarning } from '@/src/components/interest/InterestEarning'
import { Token } from '@/src/components/interest/Token'

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
      <Address address={interestReceiverAddress} title="Interest receiver address" />
    </Columns>
    <Columns>
      <Address
        address={interestEarningImplementationAddress}
        title="Interest earning implementation address"
      />
      <Address address={aaveTokenAddress} title="Aave Token address" />
    </Columns>
    <Columns>
      <Token
        title="Min. tokens not invested"
        tokenSymbol={tokenSymbol}
        value={minTokensNotInvested}
      />
      <Token
        title="Min. paid interest in a single call"
        tokenSymbol={tokenSymbol}
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
