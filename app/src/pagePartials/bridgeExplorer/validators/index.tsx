import styled from 'styled-components'
import { Validator } from '@/src/pagePartials/bridgeExplorer/validators/Validator'
import { TransactionsSigned } from '@/src/pagePartials/bridgeExplorer/validators/TransactionsSigned'
import {
  ListCard,
  ListHead,
  ListHeading,
  ListRows,
} from '@/src/pagePartials/bridgeExplorer/validators/List'
import { Bridges as BridgesConfig } from '@/src/constants/config/bridges'
import { useFetchValidatorsActivity } from '@/src/hooks/useValidators'
import { genericSuspense } from '@/src/components/safeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { get1DayBeforeInSeconds } from '@/src/utils/date'
import { isSameString } from '@/src/utils/tools'
import { useValidators } from '@/src/providers/validatorsProvider'
import { PageHeader } from '@/src/components/pageHeader'
import { SectionHeader } from '@/src/components/sectionHeader'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 4);
`

const Bridges = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 5);
`

const Bridge = styled.section`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
`

const ChartPlaceholder = styled(SkeletonLoading)`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  height: 280px;
`

const RowPlaceholder = styled.div`
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
`

type SigsCount = {
  name: string
  value: number
}

type ExecsCount = {
  name: string
  value: number
}

const Head: React.FC = () => (
  <ListHead>
    <ListHeading>Validator</ListHeading>
    <ListHeading>Last seen</ListHeading>
    <ListHeading>Signed (24h)</ListHeading>
    <ListHeading>Executed (24h)</ListHeading>
    <ListHeading>Balance</ListHeading>
    <ListHeading>Address</ListHeading>
  </ListHead>
)

const Placeholder: React.FC = () => (
  <>
    <ListCard aria-hidden>
      <Head />
      <ListRows>
        {Array.from({ length: 5 }).map((item, index) => (
          <RowPlaceholder key={index}>
            <SkeletonLoading style={{ height: '32px' }} />
          </RowPlaceholder>
        ))}
      </ListRows>
    </ListCard>
    <ChartPlaceholder />
  </>
)

const _1DayBefore = get1DayBeforeInSeconds()

const XDAIValidators: React.FC = genericSuspense(
  () => {
    const { validators: xdaiValidators } = useValidators(BridgesConfig.xdai)
    const xdaiTodaysSignedTXs = useFetchValidatorsActivity('XDAI', _1DayBefore, 'signed')
    const xdaiTodaysExecutedTXs = useFetchValidatorsActivity('XDAI', _1DayBefore, 'executed')

    return (
      <>
        <ListCard>
          <Head />
          <ListRows>
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
          </ListRows>
        </ListCard>
        <TransactionsSigned bridge={'XDAI'} />
      </>
    )
  },
  () => <Placeholder />,
)

const OmnibridgeValidators: React.FC = genericSuspense(
  () => {
    const { validators: omnibridgeValidators } = useValidators(BridgesConfig.amb)
    const omnibridgeTodaysSignedTXs = useFetchValidatorsActivity('AMB', _1DayBefore, 'signed')
    const omnibridgeTodaysExecutedTXs = useFetchValidatorsActivity('AMB', _1DayBefore, 'executed')

    return (
      <>
        <ListCard>
          <Head />
          <ListRows>
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
          </ListRows>
        </ListCard>
        <TransactionsSigned bridge={'AMB'} />
      </>
    )
  },
  () => <Placeholder />,
)

const ValidatorsHeader: React.FC = () => (
  <PageHeader
    description="The validators that sign and execute transfers on each bridge, and their activity."
    eyebrow="Bridge Explorer"
    title="Validators"
  />
)
const XDAIHeader: React.FC = () => (
  <SectionHeader description="Ethereum – Gnosis Chain" title="xDai bridge validators" />
)
const OmnibridgeHeader: React.FC = () => (
  <SectionHeader description="Ethereum – Gnosis Chain" title="Omnibridge validators" />
)

export const ValidatorsSkeleton: React.FC = () => (
  <Wrapper>
    <ValidatorsHeader />
    <Bridges>
      <Bridge>
        <XDAIHeader />
        <Placeholder />
      </Bridge>
      <Bridge>
        <OmnibridgeHeader />
        <Placeholder />
      </Bridge>
    </Bridges>
  </Wrapper>
)

export const Validators: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <ValidatorsHeader />
      <Bridges>
        <Bridge>
          <XDAIHeader />
          <XDAIValidators />
        </Bridge>
        <Bridge>
          <OmnibridgeHeader />
          <OmnibridgeValidators />
        </Bridge>
      </Bridges>
    </Wrapper>
  )
}
