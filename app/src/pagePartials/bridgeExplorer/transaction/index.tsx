import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { TokenAddress as BaseAddress } from '@/src/components/token/TokenAddress'
import { ClaimButton as BaseClaimButton } from '@/src/pagePartials/bridgeExplorer/latestTransactions/ClaimButton'
import { StatusDetails } from '@/src/pagePartials/bridgeExplorer/transaction/StatusDetails'
import { Summary, SummaryPlaceholder } from '@/src/pagePartials/bridgeExplorer/transaction/Summary'
import { Validations } from '@/src/pagePartials/bridgeExplorer/transaction/Validations'
import { DelayWarning } from '@/src/pagePartials/bridgeExplorer/transaction/DelayWarning'
import { DetailsRow } from '@/src/pagePartials/bridgeExplorer/transaction/DetailsRow'
import { useFetchTransactions } from '@/src/hooks/useTransactions'
import { TransactionExecution, getTxScanUrl } from '@/src/utils/transactions'
import { TransactionStatus } from '@/src/utils/transactions'
import { getChainIconName } from '@/src/utils/icons'
import { isSameString } from '@/src/utils/tools'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'
import { MainCard } from '@/src/components/card/MainCard'
import { ButtonGoBack } from '@/src/pagePartials/bridgeExplorer/transaction/ButtonGoBack'
import { GenericError } from '@/src/components/error/GenericError'
import { BlockConfirmations } from '@/src/pagePartials/common/BlockConfirmations'
import { ChainsKeys } from '@/src/constants/config/types'

const Wrapper = styled(MainCard)`
  padding-top: calc(var(--theme-common-space) * 4);

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    row-gap: calc(var(--theme-common-space) * 6);
  }
`

const Head = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const TxTitleWrapper = styled.div`
  max-width: 100%;
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.primary_60};
  font-size: 1.6rem;
  font-weight: 400;
  letter-spacing: 0.16rem;
  line-height: 1.2;
  margin: 0 0 calc(var(--theme-common-space) / 2);
`

const TokenAddress = styled(BaseAddress)`
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: calc(var(--theme-common-space) * 2);
  font-size: 2.4rem;
  font-weight: 500;
  line-height: 1;
  margin: 0;
  text-transform: uppercase;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 4rem;
  }
`

const Information = styled.article`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
`

const StatusList = styled.div`
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2)
    calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    padding: calc(var(--theme-common-space) * 5) calc(var(--theme-common-space) * 4);
  }
`

const ClaimButton = styled(BaseClaimButton)`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: inline-block;
  }
`

const TxInitiatedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
`

export const TransactionSkeletonLoading: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <Head>
      <TxTitleWrapper>
        <Title>Transaction</Title>
        <SkeletonLoading style={{ width: '460px', height: '48px', maxWidth: '100%' }} />
      </TxTitleWrapper>
    </Head>
    <Information>
      <SummaryPlaceholder />
      <SkeletonLoading style={{ borderRadius: '4px', height: '300px' }} />
    </Information>
  </Wrapper>
)

export const Transaction: React.FC = ({ ...restProps }) => {
  const router = useRouter()
  const transactionId = useMemo(
    () => String(router.query?.transaction),
    [router.query?.transaction],
  )
  const goBackURL = useMemo(
    () => String(router.query?.goBackURL as string),
    [router.query?.goBackURL],
  )

  const { isLoading, transactions, updateInMemoryTransaction } = useFetchTransactions(
    {},
    {
      // transactionId is txHash in on the network that originated the bridge
      where: { id: { _eq: transactionId.toLowerCase() } },
    },
  )

  // hack, for some reason TS is not recognizing that transactions[0] can be null
  const currentTx = transactions.length > 0 ? transactions[0] : null
  const txValidations = currentTx?.validations ?? []
  const txExecution = currentTx?.execution ?? ({} as TransactionExecution)
  const { validators: bridgeValidators } = useValidators(currentTx?.bridgeName as BridgesValues)

  if ((!currentTx && isLoading) || isLoading) return <TransactionSkeletonLoading />
  if (!currentTx)
    return (
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
      <Head>
        <TxTitleWrapper>
          <Title>Transaction</Title>
          <TokenAddress
            address={currentTx.transactionHash}
            bigIcons
            characters={7}
            copy
            href={getTxScanUrl(currentTx.transactionHash, currentTx.initiatorNetwork)}
          />
        </TxTitleWrapper>
        {goBackURL !== 'undefined' && <ButtonGoBack onClick={() => router.replace(goBackURL)} />}
      </Head>
      <Information>
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
          $transaction={currentTx}
          $transactionStatus={currentTx.transactionStatus}
          $updateInMemoryTransaction={updateInMemoryTransaction}
        />
        <StatusList>
          <StatusDetails
            description={`The user transferred tokens to the bridge.`}
            statusIcon="success"
            title="Bridging initiated"
            transactionStatus={TransactionStatus.Initiated}
          >
            <TxInitiatedWrapper>
              <DetailsRow
                network={currentTx.initiatorNetwork}
                title="Initiated by user"
                transaction={currentTx}
              />
              {!hasMinimumConsensus && (
                <>
                  <DelayWarning
                    initiatorNetwork={currentTx.initiatorNetwork}
                    receiverNetwork={currentTx.receiverNetwork}
                  />
                  <BlockConfirmations
                    isNativeBridge={currentTx.bridgeName === 'XDAI'}
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
              <DetailsRow network="gnosis" title="Tokens received" transaction={txExecution} />
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
                <DetailsRow
                  network={currentTx.receiverNetwork}
                  title="Tokens received"
                  transaction={currentTx.execution}
                />
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
              <ClaimButton
                transaction={currentTx}
                updateInMemoryTransaction={updateInMemoryTransaction}
              />
            </StatusDetails>
          )}
        </StatusList>
      </Information>
    </Wrapper>
  )
}
