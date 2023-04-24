import { useState } from 'react'
import styled from 'styled-components'

import { BridgeValidator } from '@/src/components/validators/BridgeValidator'
import {
  TransactionsSigned,
  weekAgoTimestamp,
} from '@/src/components/validators/TransactionsSigned'
import { Bridges } from '@/src/constants/config/bridges'
import {
  useFetchValidators,
  useFetchValidatorsExecutions,
  useFetchValidatorsSignatures,
} from '@/src/hooks/subgraph/useValidators'

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

const dayAgoTimestamp = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000
}

type SigsCount = {
  name: string
  value: number
}
type ExecsCount = {
  name: string
  value: number
}

export const BridgeValidators: React.FC = () => {
  const { validators: xdaiValidators } = useFetchValidators(Bridges.xdai)
  const { validators: ambValidators } = useFetchValidators(Bridges.amb)
  const [xdaiTimePeriod, setXDAITimePeriod] = useState(weekAgoTimestamp())
  const [ambTimePeriod, setAMBTimePeriod] = useState(weekAgoTimestamp())
  const xdaiSignedTXs = useFetchValidatorsSignatures('XDAI', xdaiTimePeriod)
  const ambSignedTXs = useFetchValidatorsSignatures('AMB', ambTimePeriod)
  const xdaiTodaysSignedTXs = useFetchValidatorsSignatures('XDAI', dayAgoTimestamp())
  const ambTodaysSignedTXs = useFetchValidatorsSignatures('AMB', dayAgoTimestamp())
  const xdaiTodaysExecutedTXs = useFetchValidatorsExecutions('XDAI', dayAgoTimestamp())
  const ambTodaysExecutedTXs = useFetchValidatorsExecutions('AMB', dayAgoTimestamp())
  if (!xdaiSignedTXs.data && xdaiSignedTXs.error) {
    throw new Error('No data for XDAI Signed Transactions')
  }
  if (!ambSignedTXs.data && ambSignedTXs.error) {
    throw new Error('No data for XDAI Signed Transactions')
  }

  return (
    <>
      <Title>
        xDai Bridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
      </Title>
      <Columns>
        <Chart data={xdaiSignedTXs.data ?? []} onTimePeriodChange={setXDAITimePeriod} />
        {xdaiValidators.map((validator, index) => {
          const todaysSignatures = xdaiTodaysSignedTXs.data?.find((signaturesCount: SigsCount) => {
            return signaturesCount.name === validator.name
          })
          const todaysExecutions = xdaiTodaysExecutedTXs.data?.find(
            (executionsCount: ExecsCount) => {
              return executionsCount.name === validator.name
            },
          )
          validator.signed = todaysSignatures?.value ?? 0
          validator.executed = todaysExecutions?.value ?? 0
          return (
            <>
              <BridgeValidator bridgeValidator={validator} key={`validator_${index}`} />
            </>
          )
        })}
      </Columns>
      <Title style={{ paddingTop: '24px' }}>
        AMB Bridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
      </Title>
      <Columns>
        <Chart data={ambSignedTXs.data ?? []} onTimePeriodChange={setAMBTimePeriod} />
        {ambValidators.map((validator, index) => {
          const todaysSignatures = ambTodaysSignedTXs.data?.find((signaturesCount: SigsCount) => {
            return signaturesCount.name === validator.name
          })
          const todaysExecutions = ambTodaysExecutedTXs.data?.find(
            (executionsCount: ExecsCount) => {
              return executionsCount.name === validator.name
            },
          )
          validator.signed = todaysSignatures?.value ?? 0
          validator.executed = todaysExecutions?.value ?? 0
          return (
            <>
              <BridgeValidator bridgeValidator={validator} key={`validator_${index}`} />
            </>
          )
        })}
      </Columns>
    </>
  )
}
