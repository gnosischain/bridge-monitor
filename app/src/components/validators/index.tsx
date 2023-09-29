import styled, { css } from 'styled-components'
import { BridgeValidator } from '@/src/components/validators/BridgeValidator'
import { TransactionsSigned } from '@/src/components/validators/TransactionsSigned'
import { Bridges } from '@/src/constants/config/bridges'
import {
  useFetchValidators,
  useFetchValidatorsExecutions,
  useFetchValidatorsSignatures,
} from '@/src/hooks/subgraph/useValidators'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

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

const ChartCSS = css`
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-column: 1 / 3;
  }
`

const Chart = styled(TransactionsSigned)`
  ${ChartCSS}
`

const ChartPlaceholder = styled(SkeletonLoading)`
  ${ChartCSS}
  border-radius: 4px;
  height: 326px;
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

const Placeholder: React.FC = () => (
  <Columns>
    <ChartPlaceholder />
    {Array.from({ length: 2 }).map((item, index) => (
      <SkeletonLoading key={index} style={{ borderRadius: '4px', height: '326px' }} />
    ))}
  </Columns>
)

const XDAIValidators: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const { validators: xdaiValidators } = useFetchValidators(Bridges.xdai)
    const xdaiTodaysSignedTXs = useFetchValidatorsSignatures('XDAI', dayAgoTimestamp())
    const xdaiTodaysExecutedTXs = useFetchValidatorsExecutions('XDAI', dayAgoTimestamp())

    return (
      <Columns {...restProps}>
        <Chart bridge={'XDAI'} />
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
            <BridgeValidator bridgeValidator={validator} key={`xDaiBridgeValidator_${index}`} />
          )
        })}
      </Columns>
    )
  },
  () => <Placeholder />,
)

const OmnibridgeValidators: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const { validators: omnibridgeValidators } = useFetchValidators(Bridges.amb)
    const omnibridgeTodaysSignedTXs = useFetchValidatorsSignatures('AMB', dayAgoTimestamp())
    const omnibridgeTodaysExecutedTXs = useFetchValidatorsExecutions('AMB', dayAgoTimestamp())

    return (
      <Columns {...restProps}>
        <Chart bridge={'AMB'} />
        {omnibridgeValidators.map((validator, index) => {
          const todaysSignatures = omnibridgeTodaysSignedTXs.data?.find(
            (signaturesCount: SigsCount) => {
              return signaturesCount.name === validator.name
            },
          )
          const todaysExecutions = omnibridgeTodaysExecutedTXs.data?.find(
            (executionsCount: ExecsCount) => {
              return executionsCount.name === validator.name
            },
          )
          validator.signed = todaysSignatures?.value ?? 0
          validator.executed = todaysExecutions?.value ?? 0

          return <BridgeValidator bridgeValidator={validator} key={`AMBBridgeValidator_${index}`} />
        })}
      </Columns>
    )
  },
  () => <Placeholder />,
)

export const BridgeValidators: React.FC = () => {
  return (
    <>
      <Title>
        xDai Bridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
      </Title>
      <XDAIValidators />
      <Title style={{ paddingTop: '24px' }}>
        Omnibridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
      </Title>
      <OmnibridgeValidators />
    </>
  )
}
