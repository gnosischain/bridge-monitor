import styled from 'styled-components'

import { BridgeValidator } from '@/src/components/validators/BridgeValidator'
import { Bridges } from '@/src/constants/config/bridges'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
`
const Title = styled.h2`
  font-size: 2.1rem;
  font-weight: 500;
  span {
    font-size: 1.6rem;
    font-weight: 300;
    font-family: ${({ theme: { fonts } }) => fonts.family};
    display: block;
    @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
      display: inline;
    }
  }
`
export const BridgeValidators: React.FC = () => {
  const { validators: xdaiValidators } = useFetchValidators(Bridges.xdai)
  const { validators: ambValidators } = useFetchValidators(Bridges.amb)

  return (
    <>
      <section>
        <Title>
          XDAI Bridge Validators <span>(Ethereum-Gnosis Chain)</span>
        </Title>
        <Columns>
          {xdaiValidators.map((validator, index) => (
            <BridgeValidator bridgeValidator={validator} key={`validator_${index}`} />
          ))}
        </Columns>
      </section>
      <section>
        <Title>
          AMB Bridge Validators <span>(Ethereum-Gnosis Chain)</span>
        </Title>
        <Columns>
          {ambValidators.map((validator, index) => (
            <BridgeValidator bridgeValidator={validator} key={`validator_${index}`} />
          ))}
        </Columns>
      </section>
    </>
  )
}
