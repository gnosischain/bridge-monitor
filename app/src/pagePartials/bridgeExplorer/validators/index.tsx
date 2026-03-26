import styled, { css } from 'styled-components'
import { Validator } from '@/src/pagePartials/bridgeExplorer/validators/Validator'
import { TransactionsSigned } from '@/src/pagePartials/bridgeExplorer/validators/TransactionsSigned'
import { Bridges as BridgesConfig } from '@/src/constants/config/bridges'
import {
  useFetchValidatorsExecutions,
  useFetchValidatorsSignatures,
} from '@/src/hooks/useValidators'
import { genericSuspense } from '@/src/components/safeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { get1DayBeforeInSeconds } from '@/src/utils/date'
import { isSameString } from '@/src/utils/tools'
import { useValidators } from '@/src/providers/validatorsProvider'
import { useEffect } from 'react'
import { MainCard } from '@/src/components/card/MainCard'
import { MainTitle } from '@/src/components/text/MainTitle'

const Wrapper = styled(MainCard)`
  --validator-item-min-height: 338px;

  row-gap: calc(var(--theme-common-space) * 2);
`

const Bridges = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 4);

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    row-gap: calc(var(--theme-common-space) * 6);
  }
`

const Bridge = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 4);
`

const Columns = styled.div`
  display: grid;
  gap: calc(var(--theme-common-space) * 2);
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    display: grid;
    gap: calc(var(--theme-common-space) * 2);
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
  margin: 0;
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
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-column: 1 / 3;
  }
`

const Chart = styled(TransactionsSigned)`
  ${ChartCSS}
`

const ChartPlaceholder = styled(SkeletonLoading)`
  ${ChartCSS};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  height: var(--validator-item-min-height);
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
    {Array.from({ length: 6 }).map((item, index) => (
      <SkeletonLoading
        key={index}
        style={{ borderRadius: '4px', height: 'var(--validator-item-min-height)' }}
      />
    ))}
  </Columns>
)

const _1DayBefore = get1DayBeforeInSeconds()

const XDAIValidators: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const { validators: xdaiValidators } = useValidators(BridgesConfig.xdai)
    const xdaiTodaysSignedTXs = useFetchValidatorsSignatures('XDAI', _1DayBefore)
    const xdaiTodaysExecutedTXs = useFetchValidatorsExecutions('XDAI', _1DayBefore)

    return (
      <Columns {...restProps}>
        <Chart bridge={'XDAI'} />
        {xdaiValidators.map((validator, index) => {
          if (validator.removed) return null
          const todaysSignatures = xdaiTodaysSignedTXs.data?.find((validatorSig) =>
            isSameString(validatorSig.name, validator.name),
          )

          const todaysExecutions = xdaiTodaysExecutedTXs.data?.find((validatorExec) =>
            isSameString(validatorExec.name, validator.name),
          )

          validator.signed = todaysSignatures?.value ?? 0
          validator.executed = todaysExecutions?.value ?? 0

          return <Validator bridgeValidator={validator} key={`xDaiBridgeValidator_${index}`} />
        })}
      </Columns>
    )
  },
  () => <Placeholder />,
)

const OmnibridgeValidators: React.FC = genericSuspense(
  ({ ...restProps }) => {
    const { validators: omnibridgeValidators } = useValidators(BridgesConfig.amb)
    const omnibridgeTodaysSignedTXs = useFetchValidatorsSignatures('AMB', _1DayBefore)
    const omnibridgeTodaysExecutedTXs = useFetchValidatorsExecutions('AMB', _1DayBefore)

    return (
      <Columns {...restProps}>
        <Chart bridge={'AMB'} />
        {omnibridgeValidators.map((validator, index) => {
          if (validator.removed) return null
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

          return <Validator bridgeValidator={validator} key={`AMBBridgeValidator_${index}`} />
        })}
      </Columns>
    )
  },
  () => <Placeholder />,
)

const ValidatorsTitle: React.FC = () => <MainTitle>Validators</MainTitle>
const XDAITitle: React.FC = () => (
  <Title>
    xDai Bridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
  </Title>
)
const OmnibridgeTitle: React.FC = () => (
  <Title>
    Omnibridge Validators <TitleNote>(Ethereum-Gnosis Chain)</TitleNote>
  </Title>
)

export const ValidatorsSkeleton: React.FC = () => (
  <Wrapper>
    <ValidatorsTitle />
    <Bridges>
      <Bridge>
        <XDAITitle />
        <Placeholder />
      </Bridge>
      <Bridge>
        <OmnibridgeTitle />
        <Placeholder />
      </Bridge>
    </Bridges>
  </Wrapper>
)

export const Validators: React.FC = ({ ...restProps }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { refetch } = useValidators(BridgesConfig.amb)

  /**
   * Call refetch to bring the last validator's activity
   */
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper {...restProps}>
      <ValidatorsTitle />
      <Bridges>
        <Bridge>
          <XDAITitle />
          <XDAIValidators />
        </Bridge>
        <Bridge>
          <OmnibridgeTitle />
          <OmnibridgeValidators />
        </Bridge>
      </Bridges>
    </Wrapper>
  )
}
