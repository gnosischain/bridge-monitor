import styled from 'styled-components'

import { Address } from '@/src/pagePartials/interest/Address'
import { Chart } from '@/src/pagePartials/interest/Chart'
import { InterestEarning } from '@/src/pagePartials/interest/InterestEarning'
import { Token } from '@/src/pagePartials/interest/Token'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Rows = styled.div`
  display: grid;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;
`

const Grid = styled.div`
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

export const XDai: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <Rows>
      <Grid>
        <InterestEarning enabled />
        <Address
          address="0x32dea44d5C243990B0133f5D103C2A784aA6a29F"
          title="Interest receiver address"
          tooltip="Configured address of the interest receiver"
        />
      </Grid>
      <Token
        title="Min. tokens not invested"
        tokenSymbol="dai"
        tooltip="The minimum amount of tokens that are not being invested."
        value="1,000,000"
      />
      <Token
        title="Min. paid interest in a single call"
        tokenSymbol="dai"
        tooltip="The minimum amount of interest generated necessary to release a claim."
        value="1,000"
      />
    </Rows>
    <Chart
      currentEarnedInterest={2593.921}
      tokenSymbol={'dai'}
      tokensNotBeingInvested={1283.506}
      underlyingTokensInvested={3000.928}
    />
  </Wrapper>
)
