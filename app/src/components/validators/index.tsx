import styled from 'styled-components'

import { BridgeValidator } from '@/src/components/validators/BridgeValidator'
import { TransactionsSigned } from '@/src/components/validators/TransactionsSigned'
import { Bridges } from '@/src/constants/config/bridges'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'

const Columns = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`
const Title = styled.h2`
  font-size: 2.1rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 8px;
`

const TitleNote = styled.span`
  display: block;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 300;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    display: inline;
  }
`

const Chart = styled(TransactionsSigned)`
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-column: 1 / 3;
  }
  display: none;
`

export const BridgeValidators: React.FC = () => {
  const { validators: xdaiValidators } = useFetchValidators(Bridges.xdai)
  const { validators: ambValidators } = useFetchValidators(Bridges.amb)

  const data = [
    [
      {
        name: 'Gnosis Safe',
        value: 3000,
      },
      {
        name: 'Protofire',
        value: 3000,
      },
      {
        name: 'Cow Protocol',
        value: 1500,
      },
      {
        name: 'Gnosis DAO',
        value: 2500,
      },
      {
        name: 'Giveth',
        value: 800,
      },
      {
        name: 'Kartpatkey',
        value: 1209,
      },
    ],
    [
      {
        name: 'Gnosis Safe',
        value: 10000,
      },
      {
        name: 'Protofire',
        value: 12000,
      },
      {
        name: 'Cow Protocol',
        value: 5000,
      },
      {
        name: 'Gnosis DAO',
        value: 1000,
      },
      {
        name: 'Giveth',
        value: 500,
      },
      {
        name: 'Kartpatkey',
        value: 7500,
      },
    ],
    [
      {
        name: 'Gnosis Safe',
        value: 25839,
      },
      {
        name: 'Protofire',
        value: 50000,
      },
      {
        name: 'Cow Protocol',
        value: 90203,
      },
      {
        name: 'Gnosis DAO',
        value: 30929,
      },
      {
        name: 'Giveth',
        value: 19029,
      },
      {
        name: 'Kartpatkey',
        value: 86000,
      },
    ],
    [
      {
        name: 'Gnosis Safe',
        value: 10000000,
      },
      {
        name: 'Protofire',
        value: 7040923,
      },
      {
        name: 'Cow Protocol',
        value: 8829000,
      },
      {
        name: 'Gnosis DAO',
        value: 8321000,
      },
      {
        name: 'Giveth',
        value: 5902001,
      },
      {
        name: 'Kartpatkey',
        value: 7500000,
      },
    ],
  ]

  return (
    <>
      <Title>
        xDai Bridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
      </Title>
      <Columns>
        <Chart data={data} />
        {xdaiValidators.map((validator, index) => (
          <BridgeValidator bridgeValidator={validator} key={`validator_${index}`} />
        ))}
      </Columns>
      <Title style={{ paddingTop: '24px' }}>
        AMB Bridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
      </Title>
      <Columns>
        <Chart data={data} />
        {ambValidators.map((validator, index) => (
          <BridgeValidator bridgeValidator={validator} key={`validator_${index}`} />
        ))}
      </Columns>
    </>
  )
}
