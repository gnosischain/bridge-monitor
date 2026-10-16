import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { TokenAddress as BaseAddress } from '@/src/components/token/TokenAddress'
import { ClaimButton } from '@/src/pagePartials/bridgeExplorer/latestTransactions/ClaimButton'
import { StatusDetails } from '@/src/pagePartials/bridgeExplorer/transaction/StatusDetails'
import { Summary, SummaryPlaceholder } from '@/src/pagePartials/bridgeExplorer/transaction/Summary'
import { Validations } from '@/src/pagePartials/bridgeExplorer/transaction/Validations'
import { DelayWarning } from '@/src/pagePartials/bridgeExplorer/transaction/DelayWarning'
import { DetailsList, DetailsRow } from '@/src/pagePartials/bridgeExplorer/transaction/DetailsRow'
import { useFetchTransactions } from '@/src/hooks/useTransactions'
import { TransactionExecution, getTxScanUrl } from '@/src/utils/transactions'
import { TransactionStatus } from '@/src/utils/transactions'
import { getChainIconName } from '@/src/utils/icons'
import { isSameString } from '@/src/utils/tools'
import { getSafeInternalURL } from '@/src/utils/navigation'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'
import { MainCard } from '@/src/components/card/MainCard'
import { ButtonGoBack } from '@/src/pagePartials/bridgeExplorer/transaction/ButtonGoBack'
import { GenericError } from '@/src/components/error/GenericError'
import { BlockConfirmations } from '@/src/pagePartials/common/BlockConfirmations'
import { ChainsKeys } from '@/src/constants/config/types'
import { PageHeader } from '@/src/components/pageHeader'
import { TransactionStatus as TransactionStatusPill } from '@/src/pagePartials/bridgeExplorer/common/TransactionStatus'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 3);
`

const ErrorCard = styled(MainCard)`
  margin: 0 auto;
  max-width: 640px;
`

const HashRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-common-space) calc(var(--theme-common-space) * 2);
`

const TokenAddress = styled(BaseAddress)`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;

  svg {
    color: ${({ theme: { colors } }) => colors.faint};

    &:hover {
      color: ${({ theme: { colors } }) => colors.ink};
    }
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 1.8rem;
  }
`

const StatusList = styled(MainCard)`
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2.5);
  row-gap: 0;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 4);
  }
`

const TxInitiatedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
`

export const TransactionSkeletonLoading: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <PageHeader
      description={<SkeletonLoading style={{ height: '24px', maxWidth: '100%', width: '360px' }} />}
      eyebrow="Bridge Explorer"
      title="Transaction details"
    />
    <SummaryPlaceholder />
    <SkeletonLoading style={{ borderRadius: '16px', height: '320px' }} />
  </Wrapper>
)

export const Transaction: React.FC = ({ ...restProps }) => {
  const router = useRouter()
  const transactionId = useMemo(
    () => String(router.query?.transaction),
    [router.query?.transaction],
  )

  const goBackURL = useMemo(
    () => getSafeInternalURL(router.query?.goBackURL),
    [router.query?.goBackURL],
  )

  const { claimActions, isError, isLoading, transactions } = useFetchTransactions({
    // transactionId is txHash in on the network that originated the bridge
    where: { id: { _eq: transactionId.toLowerCase() } },
  })

  // hack, for some reason TS is not recognizing that transactions[0] can be null
  const currentTx = transactions.length > 0 ? transactions[0] : null
  const txValidations = currentTx?.validations ?? []
  const txExecution = currentTx?.execution ?? ({} as TransactionExecution)
  const { validators: bridgeValidators } = useValidators(currentTx?.bridgeName as BridgesValues)

  if ((!currentTx && isLoading) || isLoading) return <TransactionSkeletonLoading />
  if (isError)
    return (
      <ErrorCard>
        <GenericError
          text="We couldn't load this transaction right now. Please try again in a moment."
          title="Transaction Unavailable"
        />
      </ErrorCard>
    )
  if (!currentTx)
    return (
      <ErrorCard>
        <GenericError
          text={
            <>
              Sorry, but the transaction you're looking for doesn't seem to exist. Maybe there's an
              error in the transaction's hash, or the system is still processing it.
              <br />
              <br />
              Please double-check the URL for any typos or try searching the transaction again from{' '}
              <Link href="/">the homepage</Link>.
            </>
          }
          title="Transaction Not Found"
        />
      </ErrorCard>
    )

  const hasValidations = (): boolean => {
    return txValidations !== null && txValidations.length >= 1
  }

  const hasBeenExecuted = (): boolean => {
    return txExecution !== null && txExecution.id !== undefined
  }

  const isForeignInitiated = (): boolean => currentTx.initiatorNetwork !== 'gnosis'

  const getValidatorName = (validatorAddress: string) => {
    const v = bridgeValidators.find((bridgeValidator) =>
      isSameString(bridgeValidator.address, validatorAddress),
    )

    return v?.name && v?.shortName
      ? { name: v?.name, shortName: v?.shortName }
      : { name: 'unknown', shortName: 'unknown' }
  }

  const bridgingComplete = isForeignInitiated() && hasBeenExecuted()
  const tokensBridged = !isForeignInitiated() && currentTx.execution
  const readyToClaim =
    !isForeignInitiated() &&
    currentTx.transactionStatus === TransactionStatus.Unclaimed &&
    !currentTx.execution
  const hasMinimumConsensus = hasValidations()
  const consensusAchieved = txValidations.length === 4

  return (
    <Wrapper {...restProps}>
      <PageHeader
        aside={goBackURL && <ButtonGoBack onClick={() => router.replace(goBackURL)} />}
        description={
          <HashRow>
            <TokenAddress
              address={currentTx.transactionHash}
              characters={7}
              copy
              href={getTxScanUrl(currentTx.transactionHash, currentTx.initiatorNetwork)}
            />
            <TransactionStatusPill status={currentTx.transactionStatus} />
          </HashRow>
        }
        eyebrow="Bridge Explorer"
        title="Transaction details"
      />
      <Summary
        $bridgeName={currentTx.bridgeName}
        $initiator={currentTx.initiator}
        $initiatorAmount={currentTx.initiatorAmount}
        $initiatorName={currentTx.initiator}
        $initiatorNetwork={currentTx.initiatorNetwork}
        $initiatorNetworkIcon={getChainIconName(currentTx.initiatorNetwork)}
        $initiatorToken={currentTx.initiatorToken}
        $receiver={currentTx.receiver}
        $receiverName={currentTx.receiver}
        $receiverNetwork={currentTx.receiverNetwork}
        $receiverNetworkIcon={getChainIconName(currentTx.receiverNetwork)}
        $receiverToken={currentTx.receiverToken}
        $timestampExecution={currentTx.execution?.timestamp ?? 0}
        $timestampStarted={currentTx.timestamp ?? 0}
      />
      <StatusList>
        <StatusDetails
          description={`The user transferred tokens to the bridge.`}
          statusIcon="success"
          title="Bridging initiated"
          transactionStatus={TransactionStatus.Initiated}
        >
          <TxInitiatedWrapper>
            <DetailsList>
              <DetailsRow
                network={currentTx.initiatorNetwork}
                title="Initiated by user"
                transaction={currentTx}
              />
            </DetailsList>
            {!hasMinimumConsensus && (
              <>
                <DelayWarning
                  initiatorNetwork={currentTx.initiatorNetwork}
                  receiverNetwork={currentTx.receiverNetwork}
                />
                <BlockConfirmations
                  network={currentTx.initiatorNetwork as ChainsKeys}
                  transactionHash={currentTx.transactionHash}
                />
              </>
            )}
          </TxInitiatedWrapper>
        </StatusDetails>
        {hasMinimumConsensus && (
          <StatusDetails
            description={`${txValidations.length} of 4 required confirmations.`}
            statusIcon={consensusAchieved ? 'success' : 'waiting'}
            title={consensusAchieved ? 'Consensus achieved' : 'Awaiting consensus'}
            transactionStatus={TransactionStatus.Collecting}
          >
            <Validations fetchValidatorName={getValidatorName} validations={txValidations} />
          </StatusDetails>
        )}
        {bridgingComplete && (
          <StatusDetails
            description="The tokens are in the user's address."
            statusIcon="success"
            title="Bridging complete"
            transactionStatus={TransactionStatus.Completed}
          >
            <DetailsList>
              <DetailsRow network="gnosis" title="Tokens received" transaction={txExecution} />
            </DetailsList>
          </StatusDetails>
        )}
        {tokensBridged && (
          <StatusDetails
            description="Funds should be available on receiver address."
            statusIcon="success"
            title="Tokens bridged"
            transactionStatus={currentTx.transactionStatus}
          >
            {currentTx.execution && (
              <DetailsList>
                <DetailsRow
                  network={currentTx.receiverNetwork}
                  title="Tokens received"
                  transaction={currentTx.execution}
                />
              </DetailsList>
            )}
          </StatusDetails>
        )}
        {readyToClaim && (
          <StatusDetails
            description="Claim to unlock your tokens."
            statusIcon="waiting"
            title="Ready to claim"
            transactionStatus={TransactionStatus.Unclaimed}
          >
            <ClaimButton claimActions={claimActions} transaction={currentTx} />
          </StatusDetails>
        )}
      </StatusList>
    </Wrapper>
  )
}
