import styled, { css } from 'styled-components'
import { BridgeValidator } from '@/src/components/validators/BridgeValidator'
import { TransactionsSigned } from '@/src/components/validators/TransactionsSigned'
import { Bridges } from '@/src/constants/config/bridges'
import {
  useFetchValidatorsExecutions,
  useFetchValidatorsSignatures,
} from '@/src/hooks/subgraph/useValidators'
import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { get1DayBeforeInSeconds } from '@/src/utils/date'
import { isSameString } from '@/src/utils/tools'
import { useValidators } from '@/src/providers/validatorsProvider'
import { useEffect } from 'react'
import { Wrapper } from '@/src/components/layout/Wrapper'
import { MainTitle } from '@/src/components/text/MainTitle'

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
  ${ChartCSS};
  border-radius: 4px;
  height: 326px;
`

const BridgesList = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space * 4}px;
`

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

const _1DayBefore = get1DayBeforeInSeconds()

const XDAIValidators: React.FC = ({ ...restProps }) => {
  const { validators: xdaiValidators } = useValidators(Bridges.xdai)
  const xdaiTodaysSignedTXs = useFetchValidatorsSignatures('XDAI', _1DayBefore)
  const xdaiTodaysExecutedTXs = useFetchValidatorsExecutions('XDAI', _1DayBefore)

  return (
    <Columns {...restProps}>
      <Chart bridge={'XDAI'} />

      {xdaiValidators.map((validator, index) => {
        const todaysSignatures = xdaiTodaysSignedTXs.data?.find((validatorSig) =>
          isSameString(validatorSig.name, validator.name),
        )

        const todaysExecutions = xdaiTodaysExecutedTXs.data?.find((validatorExec) =>
          isSameString(validatorExec.name, validator.name),
        )

        validator.signed = todaysSignatures?.value ?? 0
        validator.executed = todaysExecutions?.value ?? 0

        return <BridgeValidator bridgeValidator={validator} key={`xDaiBridgeValidator_${index}`} />
      })}
    </Columns>
  )
}

const OmnibridgeValidators: React.FC = ({ ...restProps }) => {
  const { validators: omnibridgeValidators } = useValidators(Bridges.amb)
  const omnibridgeTodaysSignedTXs = useFetchValidatorsSignatures('AMB', _1DayBefore)
  const omnibridgeTodaysExecutedTXs = useFetchValidatorsExecutions('AMB', _1DayBefore)

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
}

export const BridgeValidators: React.FC = ({ ...restProps }) => {
  const { refetch } = useValidators(Bridges.amb)

  // Call refetch to bring the last validator's activity
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper {...restProps}>
      <MainTitle>Validators</MainTitle>
      <BridgesList>
        <Title>
          xDai Bridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
        </Title>
        <SafeSuspense fallback={<Placeholder />}>
          <XDAIValidators />
        </SafeSuspense>
        <Title style={{ paddingTop: '24px' }}>
          Omnibridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
        </Title>
        <SafeSuspense fallback={<Placeholder />}>
          <OmnibridgeValidators />
        </SafeSuspense>
      </BridgesList>
    </Wrapper>
  )
}
